import time
import traceback
import sys
from django.db.utils import DatabaseError
from django.urls import resolve
from django.urls.exceptions import Resolver404
from rest_framework.exceptions import PermissionDenied, AuthenticationFailed
from core.logger import log_api, log_error, log_database, log_security

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

class RequestLoggingMiddleware:
    """
    Mede o tempo de execução e registra todas as requisições,
    além de interceptar códigos de status relacionados a segurança.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()
        
        response = self.get_response(request)
        
        duration = int((time.time() - start_time) * 1000)
        user_id = request.user.id if hasattr(request, 'user') and request.user.is_authenticated else 'anonymous'
        ip = get_client_ip(request)
        
        # Ignorar static/media e painel de admin se desejado, mas logaremos tudo da API
        if request.path.startswith('/api/'):
            log_api(request.method, request.path, user_id, ip, response.status_code, duration)
            
            # Security logs for 401 and 403
            if response.status_code == 401:
                log_security("UNAUTHORIZED ACCESS", user_id, request.path, "authentication_failed_or_missing")
            elif response.status_code == 403:
                log_security("FORBIDDEN ACCESS", user_id, request.path, "permission_denied")

        return response


class ExceptionLoggingMiddleware:
    """
    Captura exceções não tratadas e registra nos arquivos de log.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_exception(self, request, exception):
        user_id = request.user.id if hasattr(request, 'user') and request.user.is_authenticated else 'anonymous'
        endpoint = request.path
        
        # Ignore 404
        if isinstance(exception, Resolver404):
            return None
            
        exc_type, exc_value, exc_traceback = sys.exc_info()
        tb = traceback.extract_tb(exc_traceback)
        
        # Pegar arquivo e linha (última chamada do traceback antes da biblioteca padrão, ou a última do traceback)
        file_path = tb[-1].filename
        line_number = tb[-1].lineno
        traceback_full = "".join(traceback.format_exception(exc_type, exc_value, exc_traceback))
        exception_name = exc_type.__name__
        
        log_error(user_id, endpoint, exception_name, file_path, line_number, traceback_full)
        
        # Se for erro de banco, duplicar no log de banco
        if isinstance(exception, DatabaseError):
            # Tentar adivinhar a tabela se estiver na mensagem
            table = "unknown"
            msg = str(exception)
            if 'relation' in msg:
                parts = msg.split('"')
                if len(parts) >= 3:
                    table = parts[1]
            log_database(table, exception_name)
            
        return None  # Permite que o Django ou DRF trate a exception depois de logar
