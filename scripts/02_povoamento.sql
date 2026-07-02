-- =====================================================================
-- LifePet Care OS — 02: Povoamento Inicial (DML)
-- =====================================================================

-- Inserindo um usuário de teste (A senha real no Django será um hash PBKDF2)
INSERT INTO auth_user (username, email, password, first_name, last_name, is_active, is_staff)
VALUES ('tutor_teste', 'teste@petlife.com', 'pbkdf2_sha256$260000$mockhash123', 'João', 'Silva', TRUE, FALSE);

-- Perfil associado
INSERT INTO accounts_profile (user_id, phone, birth_date)
VALUES ((SELECT id FROM auth_user WHERE username = 'tutor_teste'), '11999999999', '1990-05-15');

-- Espécies e Raças
INSERT INTO pets_species (name) VALUES ('Cachorro'), ('Gato');

INSERT INTO pets_breed (species_id, name) VALUES 
((SELECT id FROM pets_species WHERE name = 'Cachorro'), 'Golden Retriever'),
((SELECT id FROM pets_species WHERE name = 'Cachorro'), 'Pug'),
((SELECT id FROM pets_species WHERE name = 'Gato'), 'Siamês');

-- Cadastrando um Pet
INSERT INTO pets_pet (owner_id, name, species, sex, age, weight, castrated)
VALUES (
    (SELECT id FROM auth_user WHERE username = 'tutor_teste'), 
    'Rex', 'Cachorro', 'M', 3, 15.5, TRUE
);

-- Registrando uma Vacina
INSERT INTO health_vaccine (pet_id, name, last_date, next_date, manufacturer)
VALUES (
    (SELECT id FROM pets_pet WHERE name = 'Rex'),
    'V10', '2023-01-10', '2024-01-10', 'Zoetis'
);

-- Agendando uma Consulta
INSERT INTO health_appointment (pet_id, reason, clinic, date, time, status)
VALUES (
    (SELECT id FROM pets_pet WHERE name = 'Rex'),
    'Checkup anual', 'Clínica Pet Feliz', '2023-12-05', '14:30', 'agendado'
);
