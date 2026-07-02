# Guia de Inicialização do LifePet

## 1. Instalação do Node.js
1. Baixe e instale a versão **LTS** em [nodejs.org](https://nodejs.org/).
2. Verifique a instalação no terminal:
   ```bash
   node -v
   npm -v
   ```

---

## 2. Frontend
Abra o terminal na pasta raiz do projeto:
```bash
npm install
npm run dev
```
Acesse: `http://localhost:5173`

---

## 3. Backend
Requisitos: Python 3.10+ e PostgreSQL instalado.

Abra o terminal na pasta `backend/`:
```bash
# 1. Criar ambiente virtual
python -m venv venv

# 2. Ativar ambiente virtual
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (CMD):
.\venv\Scripts\activate.bat
# Linux/macOS:
source venv/bin/activate

# 3. Instalar dependências
pip install -r requirements.txt

# 4. Configurar variáveis de ambiente
# Copie .env.example para .env e preencha as credenciais do banco de dados

# 5. Criar banco de dados (no PostgreSQL)
CREATE DATABASE lifepet_db;

# 6. Rodar migrações
python manage.py makemigrations
python manage.py migrate

# 7. Criar superusuário (opcional)
python manage.py createsuperuser

# 8. Iniciar servidor
python manage.py runserver
```
Acesse: `http://127.0.0.1:8000`
