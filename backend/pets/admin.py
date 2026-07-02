from django.contrib import admin
from .models import Pet, Especie, Raca

@admin.register(Especie)
class EspecieAdmin(admin.ModelAdmin):
    list_display = ('nome', 'created_at')

@admin.register(Raca)
class RacaAdmin(admin.ModelAdmin):
    list_display = ('nome', 'especie', 'created_at')

@admin.register(Pet)
class PetAdmin(admin.ModelAdmin):
    list_display = ('nome', 'tutor', 'especie', 'raca', 'sexo', 'idade', 'peso', 'created_at')
    search_fields = ('nome', 'tutor__username', 'tutor__email', 'codigo_vinculo')
    list_filter = ('especie', 'sexo', 'castrado', 'created_at')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
