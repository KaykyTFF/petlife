from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password, check_password
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
import random
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Perfil, CodigoRecuperacao, SolicitacaoMudancaEmail, ConfiguracaoUsuario
from .serializers import (
    UserSerializer, RegisterSerializer, PerfilSerializer, UserProfileUpdateSerializer,
    PasswordResetRequestSerializer, PasswordResetVerifySerializer, PasswordResetConfirmSerializer,
    EmailChangeRequestSerializer, EmailChangeConfirmSerializer, ChangePasswordSerializer,
    ConfiguracaoUsuarioSerializer
)
from core.logger import log_auth

class UserSettingsView(generics.RetrieveUpdateAPIView):
    """
    Endpoint para consulta e atualização das configurações de sistema do usuário.
    """
    serializer_class = ConfiguracaoUsuarioSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        settings, created = ConfiguracaoUsuario.objects.get_or_create(user=self.request.user)
        return settings

class RegisterView(generics.CreateAPIView):
    """
    Endpoint público para cadastro de novos tutores na plataforma.
    Automatiza a criação do User (auth), Perfil associado e chaves JWT iniciais.
    """
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        refresh = RefreshToken.for_user(user)
        user_serializer = UserProfileUpdateSerializer(user)
        
        
        log_auth("USER REGISTERED", user.id, email=user.email)
        
        return Response({
            'user': user_serializer.data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

class LoginView(TokenObtainPairView):
    """
    Endpoint público para autenticação de usuários via JWT.
    Retorna os tokens de acesso e refresh em caso de sucesso.
    """
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            user = User.objects.get(username=request.data.get('username') or request.data.get('email'))
            user_serializer = UserProfileUpdateSerializer(user)
            response.data['user'] = user_serializer.data
            log_auth("LOGIN SUCCESS", user.id, email=user.email)
        return response

class ProfileView(generics.RetrieveUpdateAPIView):
    """
    Endpoint privado para gerenciamento unificado do Perfil do tutor.
    """
    serializer_class = UserProfileUpdateSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

class UserMeView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        serializer = UserProfileUpdateSerializer(request.user)
        return Response(serializer.data)

class EmailChangeRequestView(APIView):
    """
    Inicia o fluxo seguro de alteração de e-mail disparando um código temporário
    para o novo endereço solicitado.
    """
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = EmailChangeRequestSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        new_email = serializer.validated_data['new_email']
        
        code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        
        SolicitacaoMudancaEmail.objects.create(
            user=request.user,
            new_email=new_email,
            code_hash=make_password(code),
            expires_at=timezone.now() + timedelta(minutes=10)
        )
        
        send_mail(
            'Alteração de E-mail - LifePet',
            f'Seu código de confirmação para alteração de e-mail é: {code}',
            None,
            [new_email],
            fail_silently=False,
        )
        
        return Response({"detail": "Enviamos um código para o novo e-mail."}, status=status.HTTP_200_OK)

class EmailChangeConfirmView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = EmailChangeConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        new_email = serializer.validated_data['new_email']
        code = serializer.validated_data['code']
        
        change_req = SolicitacaoMudancaEmail.objects.filter(
            user=request.user, 
            new_email=new_email,
            used=False
        ).first()
        
        if not change_req or not change_req.is_valid():
            return Response({"detail": "Solicitação inválida ou expirada."}, status=status.HTTP_400_BAD_REQUEST)
        
        if check_password(code, change_req.code_hash):
            if User.objects.filter(email__iexact=new_email).exclude(pk=request.user.pk).exists():
                return Response({"detail": "Este e-mail já está em uso por outro usuário."}, status=status.HTTP_400_BAD_REQUEST)
                
            user = request.user
            user.email = new_email
            user.username = new_email
            user.save()
            
            change_req.used = True
            change_req.save()
            
            return Response(UserProfileUpdateSerializer(user).data, status=status.HTTP_200_OK)
        else:
            change_req.attempts += 1
            change_req.save()
            return Response({"detail": "Código inválido."}, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(APIView):
    """
    Endpoint para alteração de senha de usuários já autenticados no sistema.
    """
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        log_auth("PASSWORD CHANGED", user.id, email=user.email)
        
        return Response({"detail": "Senha alterada com sucesso."}, status=status.HTTP_200_OK)

class PasswordResetRequestView(APIView):
    """
    Primeira etapa da recuperação de senha (Forgot Password).
    Gera e envia o código de autorização por e-mail caso a conta exista.
    """
    permission_classes = (permissions.AllowAny,)
    serializer_class = PasswordResetRequestSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        
        user = User.objects.filter(email=email).first()
        if user:
            last_code = CodigoRecuperacao.objects.filter(user=user, used=False).first()
            if last_code:
                now = timezone.now()
                elapsed = (now - last_code.created_at).total_seconds()
                if elapsed < 60:
                    wait_seconds = int(60 - elapsed)
                    return Response({
                        "detail": "Aguarde antes de solicitar um novo código.",
                        "wait_seconds": wait_seconds
                    }, status=status.HTTP_400_BAD_REQUEST)

            code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
            
            CodigoRecuperacao.objects.create(
                user=user,
                code_hash=make_password(code),
                expires_at=timezone.now() + timedelta(minutes=10)
            )
            
            send_mail(
                'Recuperação de Senha - LifePet',
                f'Seu código de recuperação é: {code}',
                None,
                [email],
                fail_silently=False,
            )
            
            return Response({
                "exists": True,
                "detail": "Código enviado.",
                "wait_seconds": 60
            }, status=status.HTTP_200_OK)
        
        return Response({
            "exists": False,
            "detail": "E-mail não cadastrado."
        }, status=status.HTTP_200_OK)

class PasswordResetVerifyCodeView(APIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = PasswordResetVerifySerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        
        user = User.objects.filter(email=email).first()
        if not user:
            return Response({"detail": "Código inválido ou expirado."}, status=status.HTTP_400_BAD_REQUEST)
        
        reset_code = CodigoRecuperacao.objects.filter(user=user).first()
        
        if reset_code and reset_code.is_valid():
            if check_password(code, reset_code.code_hash):
                return Response({"detail": "Código válido."}, status=status.HTTP_200_OK)
            else:
                reset_code.attempts += 1
                reset_code.save()
        
        return Response({"detail": "Código inválido ou expirado."}, status=status.HTTP_400_BAD_REQUEST)

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

class PasswordResetConfirmView(APIView):
    """
    Última etapa da recuperação de senha. Efetiva a troca de senha se
    o código for validado com sucesso pelas políticas de segurança.
    """
    permission_classes = (permissions.AllowAny,)
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        new_password = serializer.validated_data['new_password']
        
        user = User.objects.filter(email=email).first()
        if not user:
            return Response({"detail": "Falha na redefinição de senha."}, status=status.HTTP_400_BAD_REQUEST)
        
        reset_code = CodigoRecuperacao.objects.filter(user=user).first()
        
        if reset_code and reset_code.is_valid() and check_password(code, reset_code.code_hash):
            try:
                validate_password(new_password, user)
            except DjangoValidationError as e:
                return Response({"detail": list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.save()
            
            reset_code.used = True
            reset_code.save()
            
            log_auth("PASSWORD RESET SUCCESS", user.id, email=user.email)
            
            return Response({"detail": "Senha redefinida com sucesso."}, status=status.HTTP_200_OK)
        
        return Response({"detail": "Falha na redefinição de senha."}, status=status.HTTP_400_BAD_REQUEST)

class CheckEmailView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({"detail": "E-mail é obrigatório."}, status=status.HTTP_400_BAD_REQUEST)
        
        exists = User.objects.filter(email__iexact=email).exists()
        
        return Response({
            "exists": exists,
            "detail": "Este e-mail já está cadastrado." if exists else "E-mail disponível."
        }, status=status.HTTP_200_OK)

class DeleteAccountView(APIView):
    """
    Endpoint destrutivo para exclusão permanente de conta e de todos os dados vinculados,
    exigindo a confirmação da senha atual.
    """
    permission_classes = (permissions.IsAuthenticated,)

    def delete(self, request):
        password = request.data.get('password')
        if not password:
            return Response({"detail": "A senha atual é obrigatória para excluir a conta."}, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        if not user.check_password(password):
            return Response({"detail": "Senha incorreta."}, status=status.HTTP_400_BAD_REQUEST)
            
        log_auth("ACCOUNT DELETED", user.id, email=user.email)
        user.delete()
        return Response({"detail": "Conta excluída com sucesso."}, status=status.HTTP_204_NO_CONTENT)
