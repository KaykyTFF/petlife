# pyrefly: ignore [missing-import]
from django.urls import path, include
# pyrefly: ignore [missing-import]
from rest_framework.routers import DefaultRouter
from .views import PetViewSet, EspecieViewSet

router = DefaultRouter()
router.register(r'pets', PetViewSet, basename='pet')
router.register(r'especies', EspecieViewSet, basename='especie')

urlpatterns = [
    path('', include(router.urls)),
]
