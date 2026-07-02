from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password
from django.contrib.auth.password_validation import validate_password
from .models import Perfil, ConfiguracaoUsuario

class ConfiguracaoUsuarioSerializer(serializers.ModelSerializer):
    """
    Serializador para expor e validar as configurações de sistema do usuário (notificações e tema).
    """
    class Meta:
        model = ConfiguracaoUsuario
        fields = [
            'email_notifications', 
            'vaccine_notifications', 
            'appointment_notifications', 
            'deworming_notifications', 
            'reminder_lead_time', 
            'theme',
            'updated_at'
        ]
        read_only_fields = ['updated_at']

class PerfilSerializer(serializers.ModelSerializer):
    """
    Serializador para os dados adicionais do perfil público/privado do tutor.
    """
    class Meta:
        model = Perfil
        fields = ['phone', 'data_nascimento', 'avatar', 'created_at', 'updated_at']

class UserSerializer(serializers.ModelSerializer):
    """
    Serializador principal de leitura de dados do usuário autenticado.
    Agrupa informações do Model User (core) e Perfil (dados adicionais).
    """
    perfil = PerfilSerializer(read_only=True)
    name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'name', 'first_name', 'last_name', 'email', 'perfil']

    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializador de escrita (Update) para alterações unificadas de perfil.
    Permite modificar dados aninhados (Perfil) a partir de uma única requisição.
    """
    phone = serializers.CharField(source='perfil.phone', required=False, allow_blank=True)
    data_nascimento = serializers.DateField(source='perfil.data_nascimento', required=False, allow_null=True)
    avatar = serializers.ImageField(source='perfil.avatar', required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'phone', 'data_nascimento', 'avatar']
        read_only_fields = ['email']

    def update(self, instance, validated_data):
        perfil_data = validated_data.pop('perfil', {})
        
        # Update User fields
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.save()

        # Update Profile fields
        perfil = instance.perfil
        if 'phone' in perfil_data:
            perfil.phone = perfil_data['phone']
        if 'data_nascimento' in perfil_data:
            perfil.data_nascimento = perfil_data['data_nascimento']
        if 'avatar' in perfil_data:
            perfil.avatar = perfil_data['avatar']
        perfil.save()

        return instance

class EmailChangeRequestSerializer(serializers.Serializer):
    new_email = serializers.EmailField()
    current_password = serializers.CharField(write_only=True)

    def validate_new_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Este e-mail já está em uso por outro usuário.")
        return value.lower()

    def validate(self, data):
        user = self.context['request'].user
        if not check_password(data['current_password'], user.password):
            raise serializers.ValidationError({"current_password": "Senha atual incorreta."})
        if user.email.lower() == data['new_email'].lower():
            raise serializers.ValidationError({"new_email": "O novo e-mail deve ser diferente do atual."})
        return data

class EmailChangeConfirmSerializer(serializers.Serializer):
    new_email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)

class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, data):
        user = self.context['request'].user
        if not check_password(data['current_password'], user.password):
            raise serializers.ValidationError({"current_password": "Senha atual incorreta."})
        
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError({"new_password_confirm": "As senhas não coincidem."})
        
        try:
            validate_password(data['new_password'], user)
        except Exception as e:
            error_messages = getattr(e, 'messages', [str(e)])
            raise serializers.ValidationError({"new_password": error_messages})
            
        return data

class RegisterSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    data_nascimento = serializers.DateField(write_only=True, required=False, allow_null=True)
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'phone', 'data_nascimento', 'password', 'password_confirm']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este e-mail já está em uso.")
        return value

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "As senhas não coincidem."})
        return data

    def create(self, validated_data):
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')
        email = validated_data.pop('email')
        phone = validated_data.pop('phone', '')
        data_nascimento = validated_data.pop('data_nascimento', None)
        password = validated_data.pop('password')
        validated_data.pop('password_confirm')

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )

        if phone:
            user.perfil.phone = phone
        if data_nascimento:
            user.perfil.data_nascimento = data_nascimento
            
        user.perfil.save()

        return user

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)

class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)
    new_password = serializers.CharField(write_only=True, min_length=6)
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError({"new_password_confirm": "As senhas não coincidem."})
        return data
