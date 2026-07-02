from django.contrib import admin
from .models import Perfil, ConfiguracaoUsuario, CodigoRecuperacao, SolicitacaoMudancaEmail

@admin.register(Perfil)
class PerfilAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone', 'data_nascimento', 'created_at', 'updated_at')
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name', 'phone')
    list_filter = ('created_at', 'updated_at')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')

@admin.register(ConfiguracaoUsuario)
class ConfiguracaoUsuarioAdmin(admin.ModelAdmin):
    list_display = ('user', 'theme', 'email_notifications', 'updated_at')
    search_fields = ('user__username', 'user__email')

@admin.register(CodigoRecuperacao)
class CodigoRecuperacaoAdmin(admin.ModelAdmin):
    list_display = ('user', 'used', 'attempts', 'expires_at', 'created_at')

@admin.register(SolicitacaoMudancaEmail)
class SolicitacaoMudancaEmailAdmin(admin.ModelAdmin):
    list_display = ('user', 'new_email', 'used', 'expires_at', 'created_at')
