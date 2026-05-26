-- ========================================
-- FTOH - Formula ToH Database Schema
-- Sistema de Gerenciamento de Equipes e Economia
-- ========================================

-- Extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- TABELA DE USUÁRIOS
-- ========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    money DECIMAL(15,2) DEFAULT 1000000.00, -- Dinheiro pessoal do usuário
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- TABELA DE EQUIPES
-- ========================================
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    logo VARCHAR(255), -- URL ou path para logo da equipe
    car_model VARCHAR(50) DEFAULT 'ferrari',
    money DECIMAL(15,2) DEFAULT 500000.00, -- Dinheiro da equipe
    momento_comercial INTEGER NOT NULL DEFAULT 50 CHECK (momento_comercial BETWEEN 0 AND 100),
    prestigio INTEGER NOT NULL DEFAULT 1 CHECK (prestigio BETWEEN 1 AND 5),
    agressividade INTEGER NOT NULL DEFAULT 1 CHECK (agressividade BETWEEN 0 AND 3),
    popularidade INTEGER NOT NULL DEFAULT 1 CHECK (popularidade BETWEEN 0 AND 3),
    tecnica INTEGER NOT NULL DEFAULT 1 CHECK (tecnica BETWEEN 0 AND 3),
    nacionalidades TEXT[],
    setores TEXT[],
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- TABELA PIVOT - RELACIONAMENTO USUÁRIOS X EQUIPES
-- ========================================
CREATE TABLE user_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('driver', 'manager', 'admin')),
    selected BOOLEAN DEFAULT FALSE, -- Define qual equipe o usuário está jogando atualmente
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Um usuário só pode ter uma equipe selecionada por vez
    CONSTRAINT user_one_selected_team UNIQUE (user_id) DEFERRABLE INITIALLY DEFERRED,
    
    -- Evitar duplicação de usuário na mesma equipe
    CONSTRAINT unique_user_team UNIQUE (user_id, team_id)
);

-- ========================================
-- TABELA DE UPGRADES DISPONÍVEIS
-- ========================================
CREATE TABLE upgrades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('weather', 'pitcrew', 'training', 'engine', 'aerodynamics')),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    level_max INTEGER DEFAULT 5,
    base_cost DECIMAL(15,2) NOT NULL,
    cost_multiplier DECIMAL(3,2) DEFAULT 1.5, -- Multiplicador de custo por nível
    effect_json JSONB NOT NULL, -- Efeitos do upgrade (ex: {"pit_time_reduction": 0.1, "weather_prediction": true})
    icon VARCHAR(255), -- URL ou path para ícone do upgrade
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- TABELA DE UPGRADES DAS EQUIPES
-- ========================================
CREATE TABLE team_upgrades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    upgrade_id UUID NOT NULL REFERENCES upgrades(id) ON DELETE CASCADE,
    level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1 AND level <= 5),
    in_progress BOOLEAN DEFAULT FALSE,
    finish_time TIMESTAMP WITH TIME ZONE, -- Quando o upgrade em progresso vai terminar
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Uma equipe só pode ter um upgrade de cada tipo
    CONSTRAINT unique_team_upgrade UNIQUE (team_id, upgrade_id)
);

-- ========================================
-- TABELA DE HISTÓRICO FINANCEIRO
-- ========================================
CREATE TABLE finance_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    category VARCHAR(50) NOT NULL, -- race_prize, upgrade_cost, pit_cost, salary, etc.
    value DECIMAL(15,2) NOT NULL,
    description TEXT NOT NULL,
    reference_id UUID, -- Referência para outras tabelas (ex: upgrade_id)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- TABELA DE FILA DE TREINAMENTO
-- ========================================
CREATE TABLE training_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('fitness', 'reflexes', 'strategy', 'weather_adaptation')),
    level_target INTEGER NOT NULL CHECK (level_target >= 1 AND level_target <= 5),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    cost DECIMAL(15,2) NOT NULL,
    effects JSONB, -- Efeitos do treinamento
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================

-- Índices para usuários
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Índices para equipes
CREATE INDEX idx_teams_name ON teams(name);
CREATE INDEX idx_teams_created_at ON teams(created_at);

-- Índices para relacionamento usuário-equipes
CREATE INDEX idx_user_teams_user_id ON user_teams(user_id);
CREATE INDEX idx_user_teams_team_id ON user_teams(team_id);
CREATE INDEX idx_user_teams_selected ON user_teams(selected) WHERE selected = TRUE;

-- Índices para upgrades
CREATE INDEX idx_upgrades_type ON upgrades(type);
CREATE INDEX idx_upgrades_name ON upgrades(name);

-- Índices para upgrades das equipes
CREATE INDEX idx_team_upgrades_team_id ON team_upgrades(team_id);
CREATE INDEX idx_team_upgrades_upgrade_id ON team_upgrades(upgrade_id);
CREATE INDEX idx_team_upgrades_in_progress ON team_upgrades(in_progress) WHERE in_progress = TRUE;

-- Índices para histórico financeiro
CREATE INDEX idx_finance_history_team_id ON finance_history(team_id);
CREATE INDEX idx_finance_history_type ON finance_history(type);
CREATE INDEX idx_finance_history_created_at ON finance_history(created_at);
CREATE INDEX idx_finance_history_category ON finance_history(category);

-- Índices para fila de treinamento
CREATE INDEX idx_training_queue_team_id ON training_queue(team_id);
CREATE INDEX idx_training_queue_status ON training_queue(status);
CREATE INDEX idx_training_queue_end_time ON training_queue(end_time) WHERE status IN ('pending', 'in_progress');

-- ========================================
-- TRIGGERS E FUNÇÕES
-- ========================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_upgrades_updated_at BEFORE UPDATE ON team_upgrades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para garantir que usuário só tenha uma equipe selecionada
CREATE OR REPLACE FUNCTION ensure_one_selected_team()
RETURNS TRIGGER AS $$
BEGIN
    -- Se está marcando como selecionado, desmarcar outras
    IF NEW.selected = TRUE THEN
        UPDATE user_teams SET selected = FALSE 
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER ensure_one_selected_team_trigger
    BEFORE INSERT OR UPDATE ON user_teams
    FOR EACH ROW EXECUTE FUNCTION ensure_one_selected_team();

-- ========================================
-- VIEWS ÚTEIS
-- ========================================

-- View com informações completas das equipes
CREATE VIEW team_details AS
SELECT 
    t.*,
    COUNT(ut.id) as member_count,
    COUNT(tu.id) as upgrade_count,
    COALESCE(SUM(CASE WHEN tu.in_progress = TRUE THEN 1 ELSE 0 END), 0) as upgrades_in_progress
FROM teams t
LEFT JOIN user_teams ut ON t.id = ut.team_id
LEFT JOIN team_upgrades tu ON t.id = tu.team_id
GROUP BY t.id;

-- View com informações completas dos usuários
CREATE VIEW user_details AS
SELECT 
    u.*,
    COUNT(ut.id) as team_count,
    t.name as current_team_name,
    t.logo as current_team_logo
FROM users u
LEFT JOIN user_teams ut ON u.id = ut.user_id
LEFT JOIN teams t ON ut.team_id = t.id AND ut.selected = TRUE
GROUP BY u.id, t.name, t.logo;

-- ========================================
-- DADOS INICIAIS (OPCIONAL)
-- ========================================

-- Inserir upgrades básicos
INSERT INTO upgrades (type, name, description, level_max, base_cost, effect_json) VALUES
('weather', 'Previsão do Tempo', 'Melhora precisão das previsões meteorológicas', 5, 50000.00, '{"accuracy_bonus": 0.1}'),
('pitcrew', 'Equipe de Paddock', 'Reduz tempo de pit stop', 5, 75000.00, '{"pit_time_reduction": 0.15}'),
('training', 'Academia de Pilotos', 'Melhora performance dos pilotos', 5, 100000.00, '{"performance_bonus": 0.05}'),
('engine', 'Motor Turbo', 'Aumenta potência do motor', 5, 150000.00, '{"power_bonus": 0.08}'),
('aerodynamics', 'Túnel de Vento', 'Melhora aerodinâmica', 5, 125000.00, '{"downforce_bonus": 0.06}');

-- ========================================
-- POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY)
-- ========================================

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_upgrades ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajustar conforme necessidade de autenticação)
CREATE POLICY user_is_owner ON users USING (id = current_setting('app.current_user_id')::UUID);

-- Nota: As políticas de RLS precisarão ser ajustadas conforme o sistema de autenticação implementado
