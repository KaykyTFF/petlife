# LifePet Backend API

Este é o backend do projeto LifePet, desenvolvido com Django e Django REST Framework.

## Tecnologias

- Python 3.10+
- Django 5.0+
- Django REST Framework
- PostgreSQL
- SimpleJWT (Autenticação)
- CORS Headers

## Configuração do Ambiente

1. Clone o repositório e navegue até a pasta `backend/`.
2. Crie um ambiente virtual:
   ```bash
   py -m venv venv
   ```
3. Ative o ambiente virtual:
   - Windows PowerShell: `.\venv\Scripts\Activate.ps1`
   - Linux/macOS: `source venv/bin/activate`
4. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```

## Configuração do Banco de Dados (PostgreSQL)

1. Certifique-se de que o PostgreSQL está instalado e rodando.
2. Crie um banco de dados e um usuário:
   ```sql
   CREATE DATABASE lifepet_db;
   CREATE USER lifepet_user WITH PASSWORD 'lifepet_password';
   GRANT ALL PRIVILEGES ON DATABASE lifepet_db TO lifepet_user;
   ```
3. Copie o arquivo `.env.example` para `.env` e preencha as variáveis:
   ```bash
   cp .env.example .env
   ```

## Migrations e Superuser

1. Rode as migrations:
   ```bash
   py manage.py makemigrations
   py manage.py migrate
   ```
2. Crie um superusuário para acessar o admin:
   ```bash
   py manage.py createsuperuser
   ```

## Rodando o Servidor

```bash
py manage.py runserver
```
O servidor estará disponível em `http://127.0.0.1:8000`.

## Endpoints Principais

- **Autenticação:**
  - `POST /api/auth/register/` - Registro de novo usuário
  - `POST /api/auth/login/` - Login (retorna tokens access e refresh)
  - `POST /api/auth/token/refresh/` - Refresh do token
  - `GET /api/auth/me/` - Dados do usuário logado
  - `GET/PUT/PATCH /api/auth/profile/` - Perfil do usuário

- **Pets:**
  - `GET/POST /api/pets/` - Listar/Criar pets
  - `GET/PUT/PATCH/DELETE /api/pets/<id>/` - Detalhes/Editar/Remover pet

- **Saúde:**
  - `GET/POST /api/health/vaccines/` - Vacinas
  - `GET/POST /api/health/deworming/` - Vermífugos
  - `GET/POST /api/health/appointments/` - Consultas
  - `GET/POST /api/health/history/` - Histórico de saúde

## Segurança

- Apenas usuários autenticados podem acessar os endpoints (exceto register e login).
- Usuários só podem acessar e modificar seus próprios pets e registros de saúde.
- Dados sensíveis como senhas nunca são retornados pela API.
