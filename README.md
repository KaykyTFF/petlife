# PetLife

Sistema de gestão da saúde e bem-estar de animais de estimação. Projeto desenvolvido para as disciplinas de Engenharia de Software II e Banco de Dados II.

## Tecnologias

- **Frontend**: JavaScript (ES6+), Tailwind CSS, Vite
- **Backend**: Python 3, Django, Django REST Framework
- **Banco de Dados**: PostgreSQL

## Estrutura do Projeto

- `/docs`: Documentação técnica (Requisitos, Arquitetura, Diagramas UML e Modelo Lógico).
- `/scripts`: Scripts SQL para o banco de dados.
- `/backend`: Código-fonte da API Rest (Django).
- `/src` e `/pages`: Código-fonte da interface web.

## Como Executar

### 1. Pré-requisitos e Banco de Dados

1. Tenha o **PostgreSQL** instalado e rodando (pode utilizar o pgAdmin ou o terminal `psql`).
2. Crie um banco de dados totalmente vazio chamado `petlife`.
3. Crie um arquivo `.env` na pasta `backend/` com suas credenciais de acesso ao banco (veja o `.env.example`).


### 2. Backend

```bash
cd backend

# Criar e ativar ambiente virtual (Windows)
python -m venv venv
venv\Scripts\activate

# Linux/Mac
# source venv/bin/activate

# Instalar dependências e configurar
pip install -r requirements.txt

# Configurar as variáveis de ambiente
# Crie um arquivo .env na pasta backend com base no .env.example
# Preencha com as credenciais do seu PostgreSQL:
# DB_NAME=petlife
# DB_USER=seu_usuario
# DB_PASSWORD=sua_senha

# Rodar as migrações e iniciar o servidor
python manage.py migrate
python manage.py runserver
```
A API estará disponível em `http://localhost:8000`.

### 3. Frontend

Em um novo terminal na raiz do projeto:

```bash
npm install
npm run dev
```
Acesse a aplicação web em `http://localhost:5173`.
