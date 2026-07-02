# pyrefly: ignore [missing-import]
from rest_framework import permissions

class IsOwner(permissions.BasePermission):
    """
    Permissão personalizada para permitir apenas que os proprietários de um objeto o editem ou visualizem.
    """
    def has_object_permission(self, request, view, obj):
        return obj.tutor == request.user
