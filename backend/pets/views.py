from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Pet, Especie, Raca
from .serializers import PetSerializer, EspecieSerializer, RacaSerializer
from .permissions import IsOwner
from core.logger import log_app

class EspecieViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Endpoint de leitura para listagem de Espécies e suas Raças associadas.
    Fornece os dados base para os formulários de cadastro de pets no front-end.
    """
    queryset = Especie.objects.all()
    serializer_class = EspecieSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['get'])
    def racas(self, request, pk=None):
        especie = self.get_object()
        racas = especie.racas.all()
        serializer = RacaSerializer(racas, many=True)
        return Response(serializer.data)

class PetViewSet(viewsets.ModelViewSet):
    """
    API Endpoint para orquestração (CRUD) dos Pets.
    Aplica o filtro de tenancy (o usuário só enxerga os próprios pets)
    e garante logs de auditoria nas ações de criação, atualização e exclusão (soft delete).
    """
    serializer_class = PetSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Pet.objects.filter(tutor=self.request.user)

    def perform_create(self, serializer):
        pet = serializer.save(tutor=self.request.user)
        log_app(self.request.user.id, "create_pet", pet_id=pet.id)

    def perform_update(self, serializer):
        pet = serializer.save()
        log_app(self.request.user.id, "update_pet", pet_id=pet.id)

    def perform_destroy(self, instance):
        log_app(self.request.user.id, "delete_pet", pet_id=instance.id)
        instance.delete(user=self.request.user)
