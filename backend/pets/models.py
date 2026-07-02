
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from config.models import SoftDeleteModel
from django.utils import timezone

class Especie(models.Model):
    """
    Representa uma espécie de animal (ex: Cachorro, Gato) no catálogo base.
    """
    nome = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Espécie'
        verbose_name_plural = 'Espécies'
        ordering = ['nome']

    def __str__(self):
        return self.nome

class Raca(models.Model):
    """
    Representa uma raça específica vinculada a uma Espécie.
    """
    especie = models.ForeignKey(Especie, on_delete=models.CASCADE, related_name='racas')
    nome = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Raça'
        verbose_name_plural = 'Raças'
        ordering = ['especie', 'nome']
        constraints = [
            models.UniqueConstraint(fields=['especie', 'nome'], name='unique_breed_per_species')
        ]

    def __str__(self):
        return f"{self.nome} ({self.especie.nome})"

class Pet(SoftDeleteModel):
    """
    Representa um animal de estimação cadastrado por um Tutor (Usuário).
    Armazena dados básicos, características físicas e herda o comportamento de exclusão lógica (Soft Delete).
    """
    SEXO_CHOICES = [
        ('M', 'Macho'),
        ('F', 'Fêmea'),
    ]

    tutor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pets', db_index=True)
    nome = models.CharField(max_length=100)
    especie = models.CharField(max_length=50)  # Cão, Gato, etc. (Mantido temporariamente)
    raca = models.CharField(max_length=100, blank=True, null=True) # (Mantido temporariamente)
    
    # Novos campos de relacionamento
    especie_ref = models.ForeignKey(Especie, on_delete=models.SET_NULL, null=True, blank=True, related_name='pets')
    raca_ref = models.ForeignKey(Raca, on_delete=models.SET_NULL, null=True, blank=True, related_name='pets')
    
    sexo = models.CharField(max_length=1, choices=SEXO_CHOICES)
    
    is_filhote = models.BooleanField(default=False)
    UNIDADE_IDADE_CHOICES = [
        ('anos', 'Anos'),
        ('meses', 'Meses'),
        ('semanas', 'Semanas'),
    ]
    unidade_idade = models.CharField(max_length=10, choices=UNIDADE_IDADE_CHOICES, default='anos')
    idade = models.PositiveIntegerField(help_text="Valor numérico da idade", validators=[MinValueValidator(0)])
    peso = models.DecimalField(max_digits=5, decimal_places=2, help_text="Peso em kg", validators=[MinValueValidator(0)])
    foto = models.ImageField(upload_to='pets/', blank=True, null=True)
    alergias = models.TextField(blank=True, null=True)
    castrado = models.BooleanField(default=False)
    medicamentos_continuos = models.TextField(blank=True, null=True)
    codigo_vinculo = models.CharField(max_length=50, blank=True, null=True, unique=True, db_index=True)
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tutor', 'created_at']),
        ]
        constraints = [
            models.CheckConstraint(condition=models.Q(idade__gte=0), name='pet_age_non_negative'),
            models.CheckConstraint(condition=models.Q(peso__gte=0), name='pet_weight_non_negative'),
        ]
        verbose_name = 'Pet'
        verbose_name_plural = 'Pets'

    def __str__(self):
        return f'{self.nome} ({self.tutor.username})'

    def delete(self, user=None, *args, **kwargs):
        """
        Sobrescreve o método de exclusão para aplicar o Soft Delete no Pet 
        e retransmitir a exclusão lógica em cascata para seus registros médicos associados.
        """
        # Primeiro, marca o pet como excluído
        super().delete(user=user, *args, **kwargs)
        
        # Cascateia o Soft Delete para os dados de saúde
        self.vacinas.all().delete(user=user)
        self.vermifugos.all().delete(user=user)
        self.consultas.all().delete(user=user)
