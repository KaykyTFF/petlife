from django.contrib import admin
from .models import Vacina, Vermifugo, Consulta, HistoricoSaude

@admin.register(Vacina)
class VacinaAdmin(admin.ModelAdmin):
    list_display = ('nome', 'pet', 'ultima_data', 'proxima_data', 'concluido', 'created_at')
    search_fields = ('nome', 'pet__nome', 'pet__tutor__username')
    list_filter = ('concluido', 'ultima_data', 'proxima_data')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('proxima_data',)

@admin.register(Vermifugo)
class VermifugoAdmin(admin.ModelAdmin):
    list_display = ('nome_produto', 'pet', 'ultima_data', 'proxima_data', 'concluido', 'created_at')
    search_fields = ('nome_produto', 'pet__nome', 'pet__tutor__username')
    list_filter = ('concluido', 'ultima_data', 'proxima_data')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('proxima_data',)

@admin.register(Consulta)
class ConsultaAdmin(admin.ModelAdmin):
    list_display = ('motivo', 'pet', 'data', 'hora', 'status', 'created_at')
    search_fields = ('motivo', 'pet__nome', 'clinica', 'veterinario', 'pet__tutor__username')
    list_filter = ('status', 'data')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-data', '-hora')

@admin.register(HistoricoSaude)
class HistoricoSaudeAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'pet', 'tipo', 'data', 'created_at')
    search_fields = ('titulo', 'pet__nome', 'descricao', 'pet__tutor__username')
    list_filter = ('tipo', 'data')
    readonly_fields = ('created_at',)
    ordering = ('-data', '-created_at')
