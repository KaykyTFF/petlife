# Central de Logs LifePet

Este documento detalha o funcionamento e estrutura do sistema de logs profissional implementado no backend.

## Estrutura de Arquivos

Os arquivos de log são gerados automaticamente e armazenados na pasta `logs/` na raiz do backend (`backend/logs/`). O sistema utiliza o `RotatingFileHandler` do Python, garantindo que os logs não cresçam infinitamente:
- **Limite por arquivo**: 10MB
- **Arquivos mantidos**: Os 10 mais recentes de cada tipo.

### Tipos de Logs

1. **`app.log`**: Registra ações de negócio, como criação, edição e exclusão de Pets, Vacinas, Vermífugos e Consultas.
2. **`api.log`**: Registra TODAS as requisições que passam pelas URLs `/api/`. Inclui timestamp, método HTTP, endpoint, usuário, IP, status code e tempo de execução.
3. **`auth.log`**: Registra eventos de autenticação como Login, Registro, Alteração de Senha e Redefinição de Senha.
4. **`database.log`**: Centraliza erros provenientes do banco de dados (ex: `IntegrityError`, `DatabaseError`).
5. **`security.log`**: Exibe logs de tentativas de acessos proibidos, como retorno de códigos `401 Unauthorized` e `403 Forbidden`.
6. **`errors.log`**: Armazena o *traceback* completo de qualquer exception não tratada no servidor. Útil para debugar falhas inesperadas (500).
7. **`critical.log`**: Usado para registrar falhas severas de configuração que impedem o funcionamento geral do sistema.

## Middlewares de Log

O sistema conta com dois Middlewares globais inseridos no `settings.py`:
- `RequestLoggingMiddleware`: Mede o tempo das requisições e salva no `api.log`. Intercepta status HTTP específicos (401 e 403) para salvar no `security.log`.
- `ExceptionLoggingMiddleware`: Intercepta qualquer quebra não tratada, salva a linha, o arquivo afetado e a call stack inteira no `errors.log` de forma silenciosa e continua a propagação para evitar interrupções severas no fluxo de respostas.

## Utilitário de Consulta (CLI)

Para evitar precisar abrir cada arquivo de log no editor, incluímos o comando interativo Django.

Para visualizar as últimas linhas de um ou múltiplos logs, execute:

```bash
python manage.py logs --api
python manage.py logs --errors
python manage.py logs --auth --security --lines=50
```

**Opções disponíveis:**
- `--errors`: Mostrar logs de erros
- `--auth`: Mostrar logs de autenticação
- `--api`: Mostrar logs de API
- `--security`: Mostrar logs de segurança
- `--critical`: Mostrar logs críticos
- `--app`: Mostrar logs da aplicação
- `--database`: Mostrar logs de banco de dados
- `--lines=N`: Número de linhas a exibir (padrão: 100)

## Módulo Interno (Desenvolvedores)

Se precisar registrar uma nova funcionalidade, importe o utilitário em `backend/core/logger.py`:

```python
from core.logger import log_app

def minha_view(request):
    # Lógica
    log_app(request.user.id, "minha_nova_acao", param=123)
```

Nenhum comando de `print()` é necessário. Se a flag `DEBUG=True` estiver ligada no seu `.env`, os logs também serão exibidos no console do terminal de desenvolvimento de forma automática. Em produção (`DEBUG=False`), os logs silenciosos operam apenas gravando no disco.
