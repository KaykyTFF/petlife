from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from .models import Vacina, Vermifugo, Consulta, HistoricoSaude, EstadoNotificacao
from .serializers import (
    VacinaSerializer, VermifugoSerializer, ConsultaSerializer, 
    HistoricoSaudeSerializer, NotificationSerializer
)
from .permissions import IsPetOwner
from core.logger import log_app

class NotificationViewSet(viewsets.ViewSet):
    """
    API Endpoint para gerenciamento de notificações do usuário.
    Consolida alertas de vacinas, vermífugos e consultas baseando-se na proximidade das datas.
    """
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        user = request.user
        today = timezone.now().date()
        
        # 1. Generate dynamic notifications
        notifications = []
        
        # Vacinas
        vacinas = Vacina.objects.filter(pet__tutor=user, concluido=False, proxima_data__isnull=False)
        for v in vacinas:
            diff = (v.proxima_data - today).days
            if diff <= 7: # próximo or atrasado
                chave = f"vaccine:{v.id}:{v.proxima_data}"
                notifications.append({
                    "chave": chave,
                    "tipo": "vaccine",
                    "titulo": "Lembrete de Vacina",
                    "descricao": f"A vacina {v.nome} de {v.pet.nome} está {v.status}.",
                    "data": v.proxima_data,
                    "status": v.status,
                    "pet": {
                        "nome": v.pet.nome,
                        "foto": v.pet.foto.url if v.pet.foto else None
                    }
                })

        # Vermífugos
        vermifugos = Vermifugo.objects.filter(pet__tutor=user, concluido=False, proxima_data__isnull=False)
        for d in vermifugos:
            diff = (d.proxima_data - today).days
            if diff <= 7:
                chave = f"deworming:{d.id}:{d.proxima_data}"
                notifications.append({
                    "chave": chave,
                    "tipo": "deworming",
                    "titulo": "Lembrete de Vermífugo",
                    "descricao": f"O vermífugo {d.nome_produto} de {d.pet.nome} está {d.status}.",
                    "data": d.proxima_data,
                    "status": d.status,
                    "pet": {
                        "nome": d.pet.nome,
                        "foto": d.pet.foto.url if d.pet.foto else None
                    }
                })

        # Consultas
        consultas = Consulta.objects.filter(pet__tutor=user, status='agendado')
        for a in consultas:
            diff = (a.data - today).days
            if diff <= 7:
                chave = f"appointment:{a.id}:{a.data}"
                notifications.append({
                    "chave": chave,
                    "tipo": "appointment",
                    "titulo": "Lembrete de Consulta",
                    "descricao": f"Consulta de {a.pet.nome} ({a.motivo}) está {a.computed_status}.",
                    "data": a.data,
                    "status": a.computed_status,
                    "pet": {
                        "nome": a.pet.nome,
                        "foto": a.pet.foto.url if a.pet.foto else None
                    }
                })

        # 2. Enrich with read state
        read_states = EstadoNotificacao.objects.filter(user=user).values_list('chave_notificacao', 'is_read')
        read_map = dict(read_states)
        
        for n in notifications:
            n['is_read'] = read_map.get(n['chave'], False)

        # 3. Sort by date
        notifications.sort(key=lambda x: x['data'], reverse=True)

        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['patch'], url_path='(?P<chave>[\\w\\d:.-]+)/read')
    def mark_read(self, request, chave=None):
        state, created = EstadoNotificacao.objects.get_or_create(
            user=request.user, 
            chave_notificacao=chave,
            defaults={'is_read': True, 'read_at': timezone.now()}
        )
        if not created and not state.is_read:
            state.is_read = True
            state.read_at = timezone.now()
            state.save()
            
        return Response({"status": "success"})

    @action(detail=False, methods=['patch'], url_path='mark-all-read')
    def mark_all_read(self, request):
        today = timezone.now().date()
        user = request.user
        
        chaves = []
        chaves += [f"vaccine:{v.id}:{v.proxima_data}" for v in Vacina.objects.filter(pet__tutor=user, concluido=False, proxima_data__isnull=False) if (v.proxima_data - today).days <= 7]
        chaves += [f"deworming:{d.id}:{d.proxima_data}" for d in Vermifugo.objects.filter(pet__tutor=user, concluido=False, proxima_data__isnull=False) if (d.proxima_data - today).days <= 7]
        chaves += [f"appointment:{a.id}:{a.data}" for a in Consulta.objects.filter(pet__tutor=user, status='agendado') if (a.data - today).days <= 7]
        
        for chave in chaves:
            EstadoNotificacao.objects.update_or_create(
                user=user, 
                chave_notificacao=chave,
                defaults={'is_read': True, 'read_at': timezone.now()}
            )
            
        return Response({"status": "success"})

class VacinaViewSet(viewsets.ModelViewSet):
    """
    API Endpoint para operações CRUD no registro de Vacinas.
    Garante que o tutor só possa acessar e manipular as vacinas de seus próprios pets.
    Em caso de exclusão ou conclusão, adiciona logs de sistema e prontuário.
    """
    serializer_class = VacinaSerializer
    permission_classes = [permissions.IsAuthenticated, IsPetOwner]

    def get_queryset(self):
        queryset = Vacina.objects.filter(pet__tutor=self.request.user)
        pet_id = self.request.query_params.get('pet') or self.request.query_params.get('pet_id')
        if pet_id:
            queryset = queryset.filter(pet_id=pet_id)
        return queryset

    def perform_create(self, serializer):
        pet = serializer.validated_data['pet']
        if pet.tutor != self.request.user:
            raise PermissionDenied("Você não tem permissão para adicionar vacina a este pet.")
        vacina = serializer.save()
        log_app(self.request.user.id, "create_vaccine", vacina_id=vacina.id, pet_id=pet.id)
        HistoricoSaude.objects.create(
            pet=pet,
            tipo='Vacina',
            titulo='Vacina Adicionada',
            descricao=f'Vacina {vacina.nome} foi adicionada.',
            data=vacina.ultima_data
        )

    def perform_update(self, serializer):
        vacina = serializer.save()
        log_app(self.request.user.id, "update_vaccine", vacina_id=vacina.id, pet_id=vacina.pet.id)
        if vacina.concluido:
            HistoricoSaude.objects.create(
                pet=vacina.pet,
                tipo='Vacina',
                titulo='Vacina Aplicada',
                descricao=f'Vacina {vacina.nome} foi marcada como aplicada.',
                data=vacina.ultima_data
            )

    def perform_destroy(self, instance):
        log_app(self.request.user.id, "delete_vaccine", vacina_id=instance.id, pet_id=instance.pet.id)
        HistoricoSaude.objects.create(
            pet=instance.pet,
            tipo='Vacina',
            titulo='Vacina Removida',
            descricao=f'O registro da vacina {instance.nome} foi removido.',
            data=timezone.now().date()
        )
        instance.delete(user=self.request.user)

class VermifugoViewSet(viewsets.ModelViewSet):
    """
    API Endpoint para operações CRUD em registros de Vermífugos.
    Mantém restrições de propriedade do pet e audita alterações no histórico de saúde.
    """
    serializer_class = VermifugoSerializer
    permission_classes = [permissions.IsAuthenticated, IsPetOwner]

    def get_queryset(self):
        queryset = Vermifugo.objects.filter(pet__tutor=self.request.user)
        pet_id = self.request.query_params.get('pet') or self.request.query_params.get('pet_id')
        if pet_id:
            queryset = queryset.filter(pet_id=pet_id)
        return queryset

    def perform_create(self, serializer):
        pet = serializer.validated_data['pet']
        if pet.tutor != self.request.user:
            raise PermissionDenied("Você não tem permissão para adicionar vermífugo a este pet.")
        vermifugo = serializer.save()
        log_app(self.request.user.id, "create_deworming", vermifugo_id=vermifugo.id, pet_id=pet.id)
        HistoricoSaude.objects.create(
            pet=pet,
            tipo='Vermífugo',
            titulo='Vermífugo Adicionado',
            descricao=f'Vermífugo {vermifugo.nome_produto} foi adicionado.',
            data=vermifugo.ultima_data
        )

    def perform_update(self, serializer):
        vermifugo = serializer.save()
        log_app(self.request.user.id, "update_deworming", vermifugo_id=vermifugo.id, pet_id=vermifugo.pet.id)
        if vermifugo.concluido:
            HistoricoSaude.objects.create(
                pet=vermifugo.pet,
                tipo='Vermífugo',
                titulo='Vermífugo Aplicado',
                descricao=f'Vermífugo {vermifugo.nome_produto} foi marcado como aplicado.',
                data=vermifugo.ultima_data
            )

    def perform_destroy(self, instance):
        log_app(self.request.user.id, "delete_deworming", vermifugo_id=instance.id, pet_id=instance.pet.id)
        HistoricoSaude.objects.create(
            pet=instance.pet,
            tipo='Vermífugo',
            titulo='Vermífugo Removido',
            descricao=f'O registro do vermífugo {instance.nome_produto} foi removido.',
            data=timezone.now().date()
        )
        instance.delete(user=self.request.user)

class ConsultaViewSet(viewsets.ModelViewSet):
    """
    API Endpoint para orquestração de Consultas médicas.
    Permite agendar, alterar status (cancelar/concluir) e registrar automaticamente
    no prontuário consolidado ao término da consulta.
    """
    serializer_class = ConsultaSerializer
    permission_classes = [permissions.IsAuthenticated, IsPetOwner]

    def get_queryset(self):
        queryset = Consulta.objects.filter(pet__tutor=self.request.user)
        pet_id = self.request.query_params.get('pet') or self.request.query_params.get('pet_id')
        if pet_id:
            queryset = queryset.filter(pet_id=pet_id)
        return queryset

    def perform_create(self, serializer):
        pet = serializer.validated_data['pet']
        if pet.tutor != self.request.user:
            raise PermissionDenied("Você não tem permissão para agendar consultas para este pet.")
        consulta = serializer.save()
        log_app(self.request.user.id, "create_appointment", consulta_id=consulta.id, pet_id=pet.id)
        HistoricoSaude.objects.create(
            pet=pet,
            tipo='Consulta',
            titulo='Consulta Agendada',
            descricao=f'Consulta para {consulta.motivo} agendada para {consulta.data}.',
            data=consulta.data
        )

    def perform_update(self, serializer):
        consulta = serializer.save()
        log_app(self.request.user.id, "update_appointment", consulta_id=consulta.id, pet_id=consulta.pet.id)
        if consulta.status == 'concluido':
            HistoricoSaude.objects.create(
                pet=consulta.pet,
                tipo='Consulta',
                titulo='Consulta Realizada',
                descricao=f'Consulta para {consulta.motivo} foi marcada como concluída.',
                data=consulta.data
            )

    def perform_destroy(self, instance):
        log_app(self.request.user.id, "delete_appointment", consulta_id=instance.id, pet_id=instance.pet.id)
        HistoricoSaude.objects.create(
            pet=instance.pet,
            tipo='Consulta',
            titulo='Consulta Removida',
            descricao=f'O registro da consulta para {instance.motivo} foi removido.',
            data=timezone.now().date()
        )
        instance.delete(user=self.request.user)

class HistoricoSaudeViewSet(viewsets.ModelViewSet):
    """
    API Endpoint de leitura do Prontuário Consolidado (Histórico de Saúde).
    Fornece a linha do tempo cronológica de eventos médicos do pet.
    """
    serializer_class = HistoricoSaudeSerializer
    permission_classes = [permissions.IsAuthenticated, IsPetOwner]

    def get_queryset(self):
        queryset = HistoricoSaude.objects.filter(pet__tutor=self.request.user)
        pet_id = self.request.query_params.get('pet') or self.request.query_params.get('pet_id')
        if pet_id:
            queryset = queryset.filter(pet_id=pet_id)
        return queryset
