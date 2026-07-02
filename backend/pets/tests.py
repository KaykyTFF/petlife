from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from pets.models import Pet, Especie, Raca
from health.models import Vacina
from pets.serializers import PetSerializer
from rest_framework.exceptions import ValidationError

class PetDatabaseImprovementsTestCase(TestCase):
    def setUp(self):
        # Criar usuário tutor
        self.user = User.objects.create_user(username="tutor1", password="password123")
        
        # Criar catálogo de espécies e raças
        self.canino = Especie.objects.create(nome="Canino")
        self.felino = Especie.objects.create(nome="Felino")
        
        self.viralata = Raca.objects.create(especie=self.canino, nome="Vira-lata")
        self.persa = Raca.objects.create(especie=self.felino, nome="Persa")

    def test_soft_delete_pet(self):
        # 1. Criar um pet ativo
        pet = Pet.objects.create(
            tutor=self.user,
            nome="Rex",
            especie="Canino",
            raca="Vira-lata",
            sexo="M",
            idade=3,
            peso=10.5,
            especie_ref=self.canino,
            raca_ref=self.viralata
        )
        self.assertFalse(pet.is_deleted)
        self.assertIsNone(pet.deleted_at)
        self.assertIsNone(pet.deleted_by)

        # 2. Excluir logicamente o pet
        pet.delete(user=self.user)
        self.assertTrue(pet.is_deleted)
        self.assertIsNotNone(pet.deleted_at)
        self.assertEqual(pet.deleted_by, self.user)

        # 3. Verificar que o pet NÃO aparece no manager padrão (objects)
        self.assertEqual(Pet.objects.count(), 0)

        # 4. Verificar que o pet APARECE no manager all_objects
        self.assertEqual(Pet.all_objects.count(), 1)

    def test_cascade_soft_delete_health_records(self):
        # 1. Criar Pet
        pet = Pet.objects.create(
            tutor=self.user,
            nome="Luna",
            especie="Felino",
            raca="Persa",
            sexo="F",
            idade=2,
            peso=4.2,
            especie_ref=self.felino,
            raca_ref=self.persa
        )
        
        # 2. Criar registro de saúde (vacina)
        vacina = Vacina.objects.create(
            pet=pet,
            nome="Antirrábica",
            ultima_data=timezone.now().date(),
            proxima_data=timezone.now().date() + timezone.timedelta(days=365)
        )
        self.assertFalse(vacina.is_deleted)

        # 3. Soft-deletar o Pet
        pet.delete(user=self.user)

        # 4. Verificar se a vacina foi soft-deletada em cascata
        vacina.refresh_from_db()
        self.assertTrue(vacina.is_deleted)
        self.assertEqual(vacina.deleted_by, self.user)
        self.assertIsNotNone(vacina.deleted_at)

        # 5. Garantir que Vaccine.objects exclui a vacina do pet excluído
        self.assertEqual(Vacina.objects.count(), 0)

    def test_species_breed_coherence_validation(self):
        # Testar se o serializer impede associar uma raça de felino com espécie canina
        serializer = PetSerializer(data={
            "nome": "Thor",
            "especie_ref": self.canino.id,
            "raca_ref": self.persa.id,  # Persa é Felino!
            "sexo": "M",
            "idade": 4,
            "peso": 15.0
        })
        
        with self.assertRaises(ValidationError) as ctx:
            serializer.is_valid(raise_exception=True)
            
        self.assertIn("raca_ref", ctx.exception.detail)
        self.assertEqual(
            ctx.exception.detail["raca_ref"][0],
            "A raça selecionada não pertence à espécie selecionada."
        )

    def test_legacy_text_fields_synchronization(self):
        # Testar se os campos legados de texto são atualizados automaticamente a partir das FKs
        serializer = PetSerializer(data={
            "nome": "Bidu",
            "especie_ref": self.canino.id,
            "raca_ref": self.viralata.id,
            "sexo": "M",
            "idade": 1,
            "peso": 8.0
        })
        
        self.assertTrue(serializer.is_valid())
        pet = serializer.save(tutor=self.user)
        
        # O serializer deve preencher os campos species e breed legados com o nome correspondente
        self.assertEqual(pet.especie, "Canino")
        self.assertEqual(pet.raca, "Vira-lata")
