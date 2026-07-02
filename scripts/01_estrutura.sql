-- =====================================================================
-- LifePet Care OS — 01: Estrutura do Banco (DDL)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Tabela de Usuários (Tutor/Administrador)
-- ---------------------------------------------------------------------
CREATE TABLE auth_user (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(150) NOT NULL UNIQUE,
    email VARCHAR(254) NOT NULL,
    password VARCHAR(128) NOT NULL,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_staff BOOLEAN NOT NULL DEFAULT FALSE,
    date_joined TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 2. Perfis de Tutores
-- ---------------------------------------------------------------------
CREATE TABLE accounts_profile (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    phone VARCHAR(20) NULL,
    birth_date DATE NULL,
    avatar VARCHAR(100) NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES auth_user(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- 3. Espécies e Raças do Catálogo
-- ---------------------------------------------------------------------
CREATE TABLE pets_species (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pets_breed (
    id BIGSERIAL PRIMARY KEY,
    species_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (species_id) REFERENCES pets_species(id) ON DELETE CASCADE,
    CONSTRAINT unique_breed_per_species UNIQUE (species_id, name)
);

-- ---------------------------------------------------------------------
-- 4. Pets / Animais de Estimação (Com Soft Delete)
-- ---------------------------------------------------------------------
CREATE TABLE pets_pet (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    species VARCHAR(50) NOT NULL,
    breed VARCHAR(100) NULL,
    species_ref_id BIGINT NULL,
    breed_ref_id BIGINT NULL,
    sex VARCHAR(1) NOT NULL,
    age INTEGER NOT NULL,
    weight NUMERIC(5, 2) NOT NULL,
    photo VARCHAR(100) NULL,
    allergies TEXT NULL,
    castrated BOOLEAN NOT NULL DEFAULT FALSE,
    continuous_medications TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    deleted_by_id BIGINT NULL,
    FOREIGN KEY (owner_id) REFERENCES auth_user(id) ON DELETE CASCADE,
    FOREIGN KEY (species_ref_id) REFERENCES pets_species(id) ON DELETE SET NULL,
    FOREIGN KEY (breed_ref_id) REFERENCES pets_breed(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by_id) REFERENCES auth_user(id) ON DELETE SET NULL,
    CONSTRAINT pet_age_non_negative CHECK (age >= 0),
    CONSTRAINT pet_weight_non_negative CHECK (weight >= 0.00)
);

-- ---------------------------------------------------------------------
-- 5. Registros Médicos (Vacinas e Consultas)
-- ---------------------------------------------------------------------
CREATE TABLE health_vaccine (
    id BIGSERIAL PRIMARY KEY,
    pet_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    last_date DATE NOT NULL,
    next_date DATE NULL,
    manufacturer VARCHAR(100) NULL,
    reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (pet_id) REFERENCES pets_pet(id) ON DELETE CASCADE,
    CONSTRAINT vaccine_next_date_after_last_date CHECK (next_date >= last_date OR next_date IS NULL)
);

CREATE TABLE health_appointment (
    id BIGSERIAL PRIMARY KEY,
    pet_id BIGINT NOT NULL,
    reason VARCHAR(200) NOT NULL,
    clinic VARCHAR(100) NULL,
    veterinarian VARCHAR(100) NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'agendado',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (pet_id) REFERENCES pets_pet(id) ON DELETE CASCADE
);

-- Criação de Índices para Performance
CREATE INDEX pets_pet_owner_created_at_idx ON pets_pet (owner_id, created_at DESC);
CREATE INDEX health_vaccine_pet_next_date_idx ON health_vaccine (pet_id, next_date);
CREATE INDEX health_appointment_pet_date_idx ON health_appointment (pet_id, date);
