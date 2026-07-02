# pyrefly: ignore [missing-import]
from django.db import models
from django.contrib.auth.models import User
from pets.models import Pet
from django.utils import timezone
from config.models import SoftDeleteModel

class Vacina(SoftDeleteModel):
    """
    Mantém o registro de vacinação de um Pet, permitindo o agendamento de doses futuras 
    e controle do status de aplicação.
    """
    pet = models.ForeignKey(Pet, on_delete=models.CASCADE, related_name='vacinas')
    nome = models.CharField(max_length=100)
    ultima_data = models.DateField()
    proxima_data = models.DateField(blank=True, null=True, db_index=True)
    
    # Novos campos opcionais
    fabricante = models.CharField(max_length=100, blank=True, null=True)
    lote = models.CharField(max_length=100, blank=True, null=True)
    dose = models.CharField(max_length=50, blank=True, null=True)
    clinica = models.CharField(max_length=100, blank=True, null=True)
    veterinario = models.CharField(max_length=100, blank=True, null=True)
    lembrete_ativo = models.BooleanField(default=True)

    observacoes = models.TextField(blank=True, null=True)
    concluido = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['proxima_data', 'ultima_data']
        indexes = [
            models.Index(fields=['pet', 'proxima_data']),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(proxima_data__gte=models.F('ultima_data')) | models.Q(proxima_data__isnull=True),
                name='vaccine_next_date_after_last_date'
            )
        ]
        verbose_name = 'Vacina'
        verbose_name_plural = 'Vacinas'

    def __str__(self):
        return f'{self.nome} - {self.pet.nome}'

    @property
    def status(self):
        if self.concluido:
            return 'concluido'
        if not self.proxima_data:
            return 'sem_data'
        today = timezone.now().date()
        diff = (self.proxima_data - today).days
        if diff < 0:
            return 'atrasado'
        if diff <= 7:
            return 'próximo'
        return 'em_dia'

class Vermifugo(SoftDeleteModel):
    """
    Mantém o registro e controle de vermifugação e antipulgas de um Pet,
    calculando status de proteção e datas de reforço.
    """
    pet = models.ForeignKey(Pet, on_delete=models.CASCADE, related_name='vermifugos')
    nome_produto = models.CharField(max_length=100)
    ultima_data = models.DateField()
    proxima_data = models.DateField(blank=True, null=True, db_index=True)
    frequencia = models.CharField(max_length=50, blank=True, null=True) # Ex: 3 meses
    
    # Novos campos opcionais
    dosagem = models.CharField(max_length=50, blank=True, null=True)
    peso_momento = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    clinica = models.CharField(max_length=100, blank=True, null=True)
    veterinario = models.CharField(max_length=100, blank=True, null=True)
    lembrete_ativo = models.BooleanField(default=True)

    observacoes = models.TextField(blank=True, null=True)
    concluido = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['proxima_data', 'ultima_data']
        indexes = [
            models.Index(fields=['pet', 'proxima_data']),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(proxima_data__gte=models.F('ultima_data')) | models.Q(proxima_data__isnull=True),
                name='deworming_next_date_after_last_date'
            )
        ]
        verbose_name = 'Vermífugo'
        verbose_name_plural = 'Vermífugos'

    def __str__(self):
        return f'{self.nome_produto} - {self.pet.nome}'

    @property
    def status(self):
        if self.concluido:
            return 'concluido'
        if not self.proxima_data:
            return 'sem_data'
        today = timezone.now().date()
        diff = (self.proxima_data - today).days
        if diff < 0:
            return 'atrasado'
        if diff <= 7:
            return 'próximo'
        return 'em_dia'

class Consulta(SoftDeleteModel):
    """
    Registro de consultas e compromissos médicos (agendados, cancelados ou concluídos)
    vinculados a um Pet.
    """
    STATUS_CHOICES = [
        ('agendado', 'Agendado'),
        ('concluido', 'Concluído'),
        ('cancelado', 'Cancelado'),
    ]

    pet = models.ForeignKey(Pet, on_delete=models.CASCADE, related_name='consultas')
    motivo = models.CharField(max_length=200)
    clinica = models.CharField(max_length=100, blank=True, null=True)
    veterinario = models.CharField(max_length=100, blank=True, null=True)
    data = models.DateField(db_index=True)
    hora = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='agendado', db_index=True)
    observacoes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-data', '-hora']
        indexes = [
            models.Index(fields=['pet', 'data']),
        ]
        verbose_name = 'Consulta'
        verbose_name_plural = 'Consultas'

    def __str__(self):
        return f'{self.motivo} - {self.pet.nome} em {self.data}'

    @property
    def computed_status(self):
        if self.status != 'agendado':
            return self.status
            
        today = timezone.now().date()
        if self.data < today:
            return 'atrasado'
        return 'agendado'

class HistoricoSaude(models.Model):
    """
    Prontuário consolidado do Pet. Registra de forma imutável (append-only) 
    eventos cruciais de saúde gerados pelo sistema, como conclusão de consultas e aplicações.
    """
    pet = models.ForeignKey(Pet, on_delete=models.CASCADE, related_name='historico')
    tipo = models.CharField(max_length=50, db_index=True) # Vacina, Vermífugo, Consulta, etc.
    titulo = models.CharField(max_length=100)
    descricao = models.TextField()
    data = models.DateField(default=timezone.now, db_index=True)
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = 'Histórico de Saúde'
        verbose_name_plural = 'Históricos de Saúde'
        ordering = ['-data', '-created_at']
        indexes = [
            models.Index(fields=['pet', 'data']),
        ]

    def __str__(self):
        return f'{self.titulo} - {self.pet.nome}'

class EstadoNotificacao(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notificacoes_lidas')
    chave_notificacao = models.CharField(max_length=255, db_index=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'chave_notificacao')
        verbose_name = 'Estado de Leitura de Notificação'
        verbose_name_plural = 'Estados de Leitura de Notificação'

    def __str__(self):
        return f'{self.user.username} - {self.chave_notificacao} (Lida: {self.is_read})'
