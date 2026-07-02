from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta

class Perfil(models.Model):
    """
    Extensão do modelo User padrão do Django. 
    Armazena dados pessoais adicionais do tutor, como telefone e avatar.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    phone = models.CharField(max_length=20, blank=True, null=True)
    data_nascimento = models.DateField(blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Perfil'
        verbose_name_plural = 'Perfis'

    def __str__(self):
        return f'Perfil de {self.user.username}'

class ConfiguracaoUsuario(models.Model):
    """
    Mantém as preferências do usuário na aplicação, como ativação de notificações,
    antecedência de lembretes e preferência de tema (Claro/Escuro).
    """
    THEME_CHOICES = [
        ('light', 'Claro'),
        ('dark', 'Escuro'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='configuracao')
    email_notifications = models.BooleanField(default=True)
    vaccine_notifications = models.BooleanField(default=True)
    appointment_notifications = models.BooleanField(default=True)
    deworming_notifications = models.BooleanField(default=True)
    reminder_lead_time = models.IntegerField(default=1)  # 1, 3, or 7 days
    theme = models.CharField(max_length=10, choices=THEME_CHOICES, default='light')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Configurações de Usuário'
        verbose_name_plural = 'Configurações de Usuário'

    def __str__(self):
        return f'Configurações de {self.user.username}'

@receiver(post_save, sender=User)
def create_user_related_models(sender, instance, created, **kwargs):
    if created:
        Perfil.objects.create(user=instance)
        ConfiguracaoUsuario.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_related_models(sender, instance, **kwargs):
    if hasattr(instance, 'perfil'):
        instance.perfil.save()
    if hasattr(instance, 'configuracao'):
        instance.configuracao.save()

class CodigoRecuperacao(models.Model):
    """
    Modelo de segurança para gerenciar tokens temporários de recuperação de senha.
    Limita tentativas e define prazo de expiração para mitigar ataques de força bruta.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='codigos_recuperacao')
    code_hash = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    attempts = models.IntegerField(default=0)

    class Meta:
        verbose_name = 'Código de Recuperação'
        verbose_name_plural = 'Códigos de Recuperação'
        ordering = ['-created_at']

    def __str__(self):
        return f'Código para {self.user.email} (Usado: {self.used})'

    def is_valid(self):
        return not self.used and self.expires_at > timezone.now() and self.attempts < 5

class SolicitacaoMudancaEmail(models.Model):
    """
    Controla o fluxo de dupla etapa para alteração de e-mail do usuário.
    Gera um código temporário que deve ser validado para confirmar a propriedade do novo endereço.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='solicitacoes_email')
    new_email = models.EmailField()
    code_hash = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    attempts = models.IntegerField(default=0)

    class Meta:
        verbose_name = 'Solicitação de Mudança de E-mail'
        verbose_name_plural = 'Solicitações de Mudança de E-mail'
        ordering = ['-created_at']

    def __str__(self):
        return f'Mudança para {self.new_email} ({self.user.email})'

    def is_valid(self):
        return not self.used and self.expires_at > timezone.now() and self.attempts < 5
