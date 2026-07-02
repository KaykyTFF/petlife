-- =====================================================================
-- LifePet Care OS — 04: Principais Consultas SQL da Aplicação
-- =====================================================================

-- 1. Recuperar todos os Pets ativos de um Tutor específico (Dashboard Principal)
SELECT p.id, p.name, p.species, p.age, p.weight
FROM pets_pet p
JOIN auth_user u ON p.owner_id = u.id
WHERE u.username = 'tutor_teste' AND p.is_deleted = FALSE
ORDER BY p.created_at DESC;

-- 2. Verificar as próximas Vacinas que irão vencer nos próximos 30 dias (Sistema de Lembretes)
SELECT v.name AS vacina, v.next_date AS data_vencimento, p.name AS pet, u.email
FROM health_vaccine v
JOIN pets_pet p ON v.pet_id = p.id
JOIN auth_user u ON p.owner_id = u.id
WHERE v.next_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '30 days')
  AND v.is_deleted = FALSE
  AND p.is_deleted = FALSE;

-- 3. Histórico Médico Completo do Pet (Consultas Concluídas e Vacinas)
SELECT 'Consulta' AS tipo, reason AS descricao, date AS data_evento
FROM health_appointment
WHERE pet_id = 1 AND status = 'concluido' AND is_deleted = FALSE
UNION ALL
SELECT 'Vacina' AS tipo, name AS descricao, last_date AS data_evento
FROM health_vaccine
WHERE pet_id = 1 AND is_deleted = FALSE
ORDER BY data_evento DESC;

-- 4. Contagem de Pets Cadastrados por Espécie (Relatório Analítico)
SELECT species, COUNT(*) as total_pets
FROM pets_pet
WHERE is_deleted = FALSE
GROUP BY species
ORDER BY total_pets DESC;
