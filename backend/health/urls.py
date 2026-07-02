from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VacinaViewSet, VermifugoViewSet, ConsultaViewSet, 
    HistoricoSaudeViewSet, NotificationViewSet
)

router = DefaultRouter()
router.register(r'vacinas', VacinaViewSet, basename='vacina')
router.register(r'vermifugos', VermifugoViewSet, basename='vermifugo')
router.register(r'consultas', ConsultaViewSet, basename='consulta')
router.register(r'historico', HistoricoSaudeViewSet, basename='historico')
router.register(r'notificacoes', NotificationViewSet, basename='notificacoes')

urlpatterns = [
    path('', include(router.urls)),
]
