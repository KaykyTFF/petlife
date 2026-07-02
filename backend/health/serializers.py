from rest_framework import serializers
from .models import Vacina, Vermifugo, Consulta, HistoricoSaude

class VacinaSerializer(serializers.ModelSerializer):
    """
    Serializador para gerenciamento de Vacinas.
    Injeta dados básicos do Pet associado e valida a coerência temporal 
    (próxima data não pode ser anterior à data de aplicação).
    """
    status = serializers.ReadOnlyField()
    pet_data = serializers.SerializerMethodField()

    class Meta:
        model = Vacina
        fields = [
            'id', 'pet', 'pet_data', 'nome', 'ultima_data', 'proxima_data', 
            'fabricante', 'lote', 'dose', 'clinica', 'veterinario', 'lembrete_ativo',
            'observacoes', 'concluido', 'status', 'created_at', 'updated_at'
        ]

    def get_pet_data(self, obj):
        return {
            "id": obj.pet.id,
            "nome": obj.pet.nome,
            "foto": obj.pet.foto.url if obj.pet.foto else None,
            "raca": obj.pet.raca
        }

    def validate(self, data):
        if data.get('proxima_data') and data.get('ultima_data'):
            if data['proxima_data'] < data['ultima_data']:
                raise serializers.ValidationError({"proxima_data": "A próxima data não pode ser anterior à última data."})
        return data

class VermifugoSerializer(serializers.ModelSerializer):
    """
    Serializador para gerenciamento de Vermífugos.
    Retorna o status dinâmico calculado (em_dia, próximo, atrasado) junto aos dados de persistência.
    """
    status = serializers.ReadOnlyField()
    pet_data = serializers.SerializerMethodField()

    class Meta:
        model = Vermifugo
        fields = [
            'id', 'pet', 'pet_data', 'nome_produto', 'ultima_data', 'proxima_data', 
            'frequencia', 'dosagem', 'peso_momento', 'clinica', 'veterinario', 'lembrete_ativo',
            'observacoes', 'concluido', 'status', 'created_at', 'updated_at'
        ]

    def get_pet_data(self, obj):
        return {
            "id": obj.pet.id,
            "nome": obj.pet.nome,
            "foto": obj.pet.foto.url if obj.pet.foto else None,
            "raca": obj.pet.raca
        }

    def validate(self, data):
        if data.get('proxima_data') and data.get('ultima_data'):
            if data['proxima_data'] < data['ultima_data']:
                raise serializers.ValidationError({"proxima_data": "A próxima data não pode ser anterior à última data."})
        return data

class ConsultaSerializer(serializers.ModelSerializer):
    """
    Serializador para Agendamento de Consultas.
    Expõe o status computado em tempo real com base no atraso da data agendada.
    """
    computed_status = serializers.ReadOnlyField()
    pet_data = serializers.SerializerMethodField()

    class Meta:
        model = Consulta
        fields = [
            'id', 'pet', 'pet_data', 'motivo', 'clinica', 'veterinario', 
            'data', 'hora', 'status', 'computed_status', 'observacoes', 
            'created_at', 'updated_at'
        ]

    def get_pet_data(self, obj):
        return {
            "id": obj.pet.id,
            "nome": obj.pet.nome,
            "foto": obj.pet.foto.url if obj.pet.foto else None,
            "raca": obj.pet.raca
        }

class HistoricoSaudeSerializer(serializers.ModelSerializer):
    """
    Serializador de leitura (Read-Only na prática) para a linha do tempo do Prontuário Consolidado.
    """
    class Meta:
        model = HistoricoSaude
        fields = ['id', 'pet', 'tipo', 'titulo', 'descricao', 'data', 'created_at']

class NotificationSerializer(serializers.Serializer):
    """
    Serializador de estrutura de dados livre (não associada diretamente a um único Model).
    Padroniza o payload de notificações agregadas enviado para a interface web.
    """
    chave = serializers.CharField(source='key', required=False)  # Map back to key if needed or keep chave
    tipo = serializers.CharField()
    titulo = serializers.CharField()
    descricao = serializers.CharField()
    data = serializers.DateField()
    is_read = serializers.BooleanField()
    status = serializers.CharField() # próxima, vencida
    pet = serializers.DictField()
