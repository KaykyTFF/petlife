from rest_framework import serializers
from .models import Pet, Especie, Raca

class EspecieSerializer(serializers.ModelSerializer):
    """
    Serializador para listar as Espécies disponíveis no catálogo base do sistema.
    """
    class Meta:
        model = Especie
        fields = ['id', 'nome', 'created_at', 'updated_at']

class RacaSerializer(serializers.ModelSerializer):
    """
    Serializador para expor as Raças cadastradas, incluindo o nome descritivo da Espécie vinculada.
    """
    especie_nome = serializers.CharField(source='especie.nome', read_only=True)

    class Meta:
        model = Raca
        fields = ['id', 'especie', 'especie_nome', 'nome', 'created_at', 'updated_at']

class PetSerializer(serializers.ModelSerializer):
    """
    Serializador principal para leitura e escrita de dados de Pets.
    Aplica validações de consistência (ex: idade e peso positivos, coerência entre Espécie e Raça)
    e sincroniza as chaves estrangeiras com os campos legados para retrocompatibilidade.
    """
    tutor = serializers.ReadOnlyField(source='tutor.username')
    especie = serializers.CharField(required=False)
    raca = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    especie_ref_nome = serializers.CharField(source='especie_ref.nome', read_only=True)
    raca_ref_nome = serializers.CharField(source='raca_ref.nome', read_only=True)

    class Meta:
        model = Pet
        fields = [
            'id', 'tutor', 'nome', 'especie', 'raca', 
            'especie_ref', 'raca_ref', 'especie_ref_nome', 'raca_ref_nome',
            'sexo', 'is_filhote', 'unidade_idade', 'idade', 'peso', 'foto', 'alergias', 'castrado', 
            'medicamentos_continuos', 'codigo_vinculo', 'created_at', 'updated_at'
        ]

    def validate_peso(self, value):
        if value < 0:
            raise serializers.ValidationError("O peso não pode ser negativo.")
        return value

    def validate_idade(self, value):
        if value < 0:
            raise serializers.ValidationError("A idade não pode ser negativa.")
        return value

    def validate(self, data):
        especie_ref = data.get('especie_ref')
        raca_ref = data.get('raca_ref')

        # Se for criação, validar que a espécie está presente
        if not self.instance and not data.get('especie') and not especie_ref:
            raise serializers.ValidationError({
                "especie_ref": "A espécie é obrigatória."
            })

        # Validar coerência de Espécie e Raça se ambos forem informados
        if raca_ref and especie_ref and raca_ref.especie != especie_ref:
            raise serializers.ValidationError({
                "raca_ref": "A raça selecionada não pertence à espécie selecionada."
            })

        # Sincronizar campos de texto legados com base nas referências FK
        if especie_ref:
            data['especie'] = especie_ref.nome
        if raca_ref:
            data['raca'] = raca_ref.nome

        return data
