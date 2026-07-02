from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

class SoftDeleteQuerySet(models.QuerySet):
    """
    Extensão de QuerySet para suportar exclusão lógica em lote (bulk delete).
    """
    def delete(self, user=None):
        return self.update(is_deleted=True, deleted_at=timezone.now(), deleted_by=user)

    def hard_delete(self):
        return super().delete()

class SoftDeleteManager(models.Manager):
    """
    Manager customizado que injeta o filtro `is_deleted=False` por padrão,
    mascutando os registros deletados das queries da aplicação (Active Record).
    """
    def __init__(self, *args, **kwargs):
        self.show_deleted = kwargs.pop('show_deleted', False)
        super().__init__(*args, **kwargs)

    def get_queryset(self):
        if self.show_deleted:
            return SoftDeleteQuerySet(self.model, using=self._db)
        return SoftDeleteQuerySet(self.model, using=self._db).filter(is_deleted=False)

class SoftDeleteModel(models.Model):
    """
    Classe Abstrata base para Modelos que exigem retenção histórica.
    Substitui o DELETE físico do banco por um UPDATE (is_deleted=True),
    preservando os dados para auditoria.
    """
    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(blank=True, null=True)
    deleted_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="%(class)s_deleted"
    )

    objects = SoftDeleteManager()
    all_objects = SoftDeleteManager(show_deleted=True)

    class Meta:
        abstract = True

    def delete(self, user=None, *args, **kwargs):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        if user:
            self.deleted_by = user
        self.save()

    def hard_delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)
