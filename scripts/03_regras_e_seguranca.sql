-- =====================================================================
-- LifePet Care OS — 03: Regras Ativas, Transações e Segurança
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Regras Ativas e Lógica Interna (Trigger)
-- ---------------------------------------------------------------------
-- Regra de Negócio: Não permitir agendamento de consultas ou vacinas 
-- para um Pet que foi excluído logicamente (Soft Delete).

CREATE OR REPLACE FUNCTION block_action_on_deleted_pet()
RETURNS TRIGGER AS $$
DECLARE
    pet_deleted BOOLEAN;
BEGIN
    SELECT is_deleted INTO pet_deleted FROM pets_pet WHERE id = NEW.pet_id;
    
    IF pet_deleted = TRUE THEN
        RAISE EXCEPTION 'Operação negada: Não é possível inserir registros médicos para um Pet inativo/excluído.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_pet_status_vaccine
BEFORE INSERT OR UPDATE ON health_vaccine
FOR EACH ROW EXECUTE FUNCTION block_action_on_deleted_pet();

CREATE TRIGGER trg_check_pet_status_appointment
BEFORE INSERT OR UPDATE ON health_appointment
FOR EACH ROW EXECUTE FUNCTION block_action_on_deleted_pet();


-- ---------------------------------------------------------------------
-- 2. Gerenciamento de Transações (Propriedades ACID)
-- ---------------------------------------------------------------------
-- Exemplo de Transação Crítica: Deleção lógica de um Pet e cancelamento 
-- em cascata de suas consultas futuras (Garante Atomicidade e Consistência).

BEGIN; -- Inicia a transação ACID
    -- Marca o pet como deletado
    UPDATE pets_pet 
    SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP
    WHERE id = 1;

    -- Cancela as consultas futuras que estavam agendadas
    UPDATE health_appointment 
    SET status = 'cancelado', is_deleted = TRUE
    WHERE pet_id = 1 AND date >= CURRENT_DATE;
COMMIT; -- Efetiva as alterações se não houver erro (ou ROLLBACK em caso de falha)


-- ---------------------------------------------------------------------
-- 3. Segurança e Controle de Acesso (DCL)
-- ---------------------------------------------------------------------

-- Criação de um Papel (Role) para o Banco de Dados
CREATE ROLE petlife_admin_role;
CREATE ROLE petlife_app_user_role LOGIN PASSWORD 'senhaSegura123';

-- Concedendo privilégios estruturais para o admin
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO petlife_admin_role;

-- A aplicação web (Django) deve acessar com privilégios limitados de DML
GRANT SELECT, INSERT, UPDATE, DELETE ON auth_user, accounts_profile, pets_pet, health_vaccine, health_appointment TO petlife_app_user_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO petlife_app_user_role;

-- Revogando permissões críticas da aplicação (Apenas o Admin pode dropar tabelas ou usar TRUNCATE)
REVOKE TRUNCATE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA public FROM petlife_app_user_role;
