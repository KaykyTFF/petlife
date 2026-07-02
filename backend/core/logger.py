import os
import logging
from logging.handlers import RotatingFileHandler
from datetime import datetime
from django.conf import settings

# Caminho absoluto para a pasta logs/
LOGS_DIR = os.path.join(settings.BASE_DIR, 'logs')

# Criar pasta caso não exista
if not os.path.exists(LOGS_DIR):
    os.makedirs(LOGS_DIR)

def get_logger(name, filename):
    """
    Retorna um logger configurado com RotatingFileHandler.
    """
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        
        file_path = os.path.join(LOGS_DIR, filename)
        # Rotaciona em 10MB mantendo os últimos 10
        handler = RotatingFileHandler(file_path, maxBytes=10*1024*1024, backupCount=10)
        
        # Formato apenas com a mensagem, pois vamos customizar a estrutura de logs manualmente
        formatter = logging.Formatter('%(message)s')
        handler.setFormatter(formatter)
        
        logger.addHandler(handler)
        logger.propagate = False
    return logger

# Instanciando loggers
app_logger = get_logger('app_logger', 'app.log')
api_logger = get_logger('api_logger', 'api.log')
auth_logger = get_logger('auth_logger', 'auth.log')
db_logger = get_logger('db_logger', 'database.log')
security_logger = get_logger('security_logger', 'security.log')
error_logger = get_logger('error_logger', 'errors.log')
critical_logger = get_logger('critical_logger', 'critical.log')

def get_timestamp():
    return datetime.now().strftime("[%Y-%m-%d %H:%M:%S]")

def _console_log_if_debug(msg):
    if settings.DEBUG:
        print(msg)

def log_app(user_id, action, **kwargs):
    timestamp = get_timestamp()
    kwargs_str = "\n".join([f"{k}={v}" for k, v in kwargs.items()])
    msg = f"{timestamp}\nINFO\nuser={user_id}\naction={action}\n{kwargs_str}\n{'-'*26}"
    app_logger.info(msg)
    _console_log_if_debug(msg)

def log_api(method, path, user_id, ip, status, duration):
    msg = f"{method} {path}\nuser={user_id}\nip={ip}\nstatus={status}\nduration={duration}ms\n{'-'*26}"
    api_logger.info(msg)

def log_auth(action_msg, user_id, email=None):
    email_str = f"email={email}\n" if email else ""
    msg = f"{action_msg}\nuser={user_id}\n{email_str}{'-'*26}"
    auth_logger.info(msg)
    _console_log_if_debug(msg)

def log_database(table, error_name):
    msg = f"DATABASE ERROR\ntable={table}\nerror={error_name}\n{'-'*26}"
    db_logger.info(msg)
    _console_log_if_debug(msg)

def log_security(action_msg, user_id, endpoint, reason):
    msg = f"{action_msg}\nuser={user_id}\nendpoint={endpoint}\nreason={reason}\n{'-'*26}"
    security_logger.info(msg)
    _console_log_if_debug(msg)

def log_error(user_id, endpoint, exception_name, file_path, line_number, traceback_full):
    timestamp = get_timestamp()
    msg = (f"{timestamp}\n"
           f"Exception:\n{exception_name}\n\n"
           f"File:\n{file_path}\n\n"
           f"Line:\n{line_number}\n\n"
           f"User:\n{user_id}\n\n"
           f"Endpoint:\n{endpoint}\n\n"
           f"Traceback:\n{traceback_full}\n{'-'*26}")
    error_logger.info(msg)
    _console_log_if_debug(f"ERROR: {exception_name} in {file_path}:{line_number}")

def log_critical(reason, **kwargs):
    timestamp = get_timestamp()
    kwargs_str = "\n".join([f"{k}={v}" for k, v in kwargs.items()])
    msg = f"{timestamp}\nCRITICAL\nreason={reason}\n{kwargs_str}\n{'-'*26}"
    critical_logger.info(msg)
    _console_log_if_debug(msg)
