from rest_framework import permissions

class IsPetOwner(permissions.BasePermission):
    """
    Permissão personalizada para permitir apenas que o proprietário do pet acesse os registros de saúde.
    """
    def has_object_permission(self, request, view, obj):
        return obj.pet.tutor == request.user
