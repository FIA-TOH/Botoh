-- FTOH Racing Team Management System
-- PostgreSQL Schema v1.0

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE USER_ROLE AS ENUM ('admin', 'manager', 'driver');
CREATE TYPE UPGRADE_CATEGORY AS ENUM ('engine', 'aerodynamics', 'chassis', 'electronics');

-- Teams Table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Team statistics
    total_wins INTEGER DEFAULT 0,
    total_races INTEGER DEFAULT 0,
    championship_points INTEGER DEFAULT 0,
    
    -- Team budget
    budget INTEGER DEFAULT 1000000,

    -- Commercial profile
    momento_comercial INTEGER NOT NULL DEFAULT 50 CHECK (momento_comercial BETWEEN 0 AND 100),
    prestigio INTEGER NOT NULL DEFAULT 1 CHECK (prestigio BETWEEN 1 AND 5),
    agressividade INTEGER NOT NULL DEFAULT 1 CHECK (agressividade BETWEEN 0 AND 3),
    popularidade INTEGER NOT NULL DEFAULT 1 CHECK (popularidade BETWEEN 0 AND 3),
    tecnica INTEGER NOT NULL DEFAULT 1 CHECK (tecnica BETWEEN 0 AND 3),
    nacionalidades TEXT[],
    setores TEXT[],
    logo_url TEXT,
    
    -- Team status
    is_active BOOLEAN DEFAULT true,
    
    CONSTRAINT teams_name_length CHECK (LENGTH(name) >= 3),
    CONSTRAINT teams_budget_positive CHECK (budget >= 0)
);

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    
    -- User relationships
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    
    -- User profile
    role USER_ROLE DEFAULT 'driver',
    display_name VARCHAR(100),
    avatar_url VARCHAR(500),
    
    -- Game statistics
    money INTEGER DEFAULT 50000,
    experience_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    
    -- Racing statistics
    races_completed INTEGER DEFAULT 0,
    races_won INTEGER DEFAULT 0,
    podium_finishes INTEGER DEFAULT 0,
    best_lap_time INTERVAL,
    
    -- Account status
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT users_username_length CHECK (LENGTH(username) >= 3),
    CONSTRAINT users_username_format CHECK (username ~ '^[a-zA-Z0-9_]+$'),
    CONSTRAINT users_money_positive CHECK (money >= 0),
    CONSTRAINT users_level_positive CHECK (level > 0)
);

-- Upgrades Table
CREATE TABLE upgrades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category UPGRADE_CATEGORY NOT NULL,
    
    -- Pricing and availability
    price INTEGER NOT NULL,
    level_required INTEGER DEFAULT 1,
    max_quantity_per_team INTEGER DEFAULT 1,
    
    -- Upgrade effects
    speed_bonus DECIMAL(5,2) DEFAULT 0.00,        -- Percentage speed increase
    handling_bonus DECIMAL(5,2) DEFAULT 0.00,     -- Percentage handling improvement
    reliability_bonus DECIMAL(5,2) DEFAULT 0.00,  -- Percentage reliability increase
    
    -- Visual representation
    icon_url VARCHAR(500),
    color_code VARCHAR(7) DEFAULT '#000000',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_premium BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT upgrades_price_positive CHECK (price > 0),
    CONSTRAINT upgrades_level_positive CHECK (level_required >= 1),
    CONSTRAINT upgrades_bonus_ranges CHECK (
        speed_bonus >= 0 AND speed_bonus <= 100 AND
        handling_bonus >= 0 AND handling_bonus <= 100 AND
        reliability_bonus >= 0 AND reliability_bonus <= 100
    ),
    CONSTRAINT upgrades_color_format CHECK (color_code ~ '^#[0-9A-Fa-f]{6}$')
);

-- User Upgrades Junction Table
CREATE TABLE user_upgrades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    upgrade_id UUID NOT NULL REFERENCES upgrades(id) ON DELETE CASCADE,
    
    -- Purchase details
    purchase_price INTEGER NOT NULL,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Usage status
    is_equipped BOOLEAN DEFAULT false,
    quantity INTEGER DEFAULT 1,
    
    -- Unique constraint to prevent duplicate purchases
    UNIQUE(user_id, upgrade_id),
    
    CONSTRAINT user_upgrades_quantity_positive CHECK (quantity > 0),
    CONSTRAINT user_upgrades_price_positive CHECK (purchase_price > 0)
);

-- Race History Table (for tracking user performance)
CREATE TABLE race_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    
    -- Race details
    race_name VARCHAR(200) NOT NULL,
    circuit_name VARCHAR(100),
    race_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Performance metrics
    finishing_position INTEGER,
    points_earned INTEGER DEFAULT 0,
    prize_money INTEGER DEFAULT 0,
    lap_times INTERVAL[],
    
    -- Race conditions
    weather_condition VARCHAR(50),
    tire_compound VARCHAR(50),
    
    -- Status
    is_completed BOOLEAN DEFAULT false,
    did_not_finish_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT race_history_position_positive CHECK (finishing_position > 0),
    CONSTRAINT race_history_points_non_negative CHECK (points_earned >= 0),
    CONSTRAINT race_history_money_non_negative CHECK (prize_money >= 0)
);

-- Team Members Table (for managing team composition)
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Member details
    role_in_team VARCHAR(50) DEFAULT 'Driver',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    
    -- Unique constraint to prevent duplicate memberships
    UNIQUE(team_id, user_id),
    
    CONSTRAINT team_members_role_length CHECK (LENGTH(role_in_team) >= 2)
);

-- Create indexes for performance optimization
CREATE INDEX idx_users_team_id ON users(team_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);

CREATE INDEX idx_teams_active ON teams(is_active);
CREATE INDEX idx_teams_name ON teams(name);

CREATE INDEX idx_upgrades_category ON upgrades(category);
CREATE INDEX idx_upgrades_active ON upgrades(is_active);
CREATE INDEX idx_upgrades_price ON upgrades(price);

CREATE INDEX idx_user_upgrades_user_id ON user_upgrades(user_id);
CREATE INDEX idx_user_upgrades_upgrade_id ON user_upgrades(upgrade_id);
CREATE INDEX idx_user_upgrades_equipped ON user_upgrades(is_equipped);

CREATE INDEX idx_race_history_user_id ON race_history(user_id);
CREATE INDEX idx_race_history_team_id ON race_history(team_id);
CREATE INDEX idx_race_history_date ON race_history(race_date);

CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_active ON team_members(is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_upgrades_updated_at BEFORE UPDATE ON upgrades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial data

-- Create default team
INSERT INTO teams (name, budget) VALUES 
('Scuderia FTOH', 5000000);

-- Create admin user (password: admin123)
INSERT INTO users (username, email, password_hash, team_id, role, money, experience_points, level, is_active, is_verified) VALUES 
('admin', 'admin@ftoh.com', '$2a$12$WB2anVlK1QLKt44kKlQpQutMvjydFSeJC5jusDJuI7YOQVxgE7JeG', 
 (SELECT id FROM teams WHERE name = 'Scuderia FTOH'), 'admin', 1000000, 10000, 10, true, true);

-- Create initial upgrades
INSERT INTO upgrades (name, description, category, price, level_required, speed_bonus, handling_bonus, reliability_bonus, icon_url, color_code) VALUES 
('V12 Engine Upgrade', 'High-performance V12 engine with improved power delivery', 'engine', 150000, 1, 15.50, 5.00, 2.50, '/icons/engine-v12.png', '#FF0000'),
('Advanced Aerodynamics Package', 'Optimized front and rear wings for maximum downforce', 'aerodynamics', 85000, 1, 8.00, 12.00, 3.00, '/icons/wings-advanced.png', '#0066CC'),
('Carbon Fiber Chassis', 'Lightweight carbon fiber monocoque chassis', 'chassis', 120000, 2, 10.00, 8.00, 15.00, '/icons/chassis-carbon.png', '#333333'),
('Electronics Suite', 'Advanced telemetry and control systems', 'electronics', 65000, 1, 3.00, 6.00, 8.00, '/icons/electronics-pro.png', '#00AA00');

-- Create sample team member (admin as team principal)
INSERT INTO team_members (team_id, user_id, role_in_team) VALUES 
((SELECT id FROM teams WHERE name = 'Scuderia FTOH'), (SELECT id FROM users WHERE username = 'admin'), 'Team Principal');

-- Create view for team statistics
CREATE VIEW team_stats AS
SELECT 
    t.id,
    t.name,
    t.budget,
    t.total_wins,
    t.total_races,
    t.championship_points,
    COUNT(DISTINCT tm.user_id) as member_count,
    COALESCE(SUM(u.money), 0) as total_member_money,
    COUNT(DISTINCT uu.upgrade_id) as total_upgrades_owned
FROM teams t
LEFT JOIN team_members tm ON t.id = tm.team_id AND tm.is_active = true
LEFT JOIN users u ON tm.user_id = u.id
LEFT JOIN user_upgrades uu ON u.id = uu.user_id
WHERE t.is_active = true
GROUP BY t.id, t.name, t.budget, t.total_wins, t.total_races, t.championship_points;

-- Create view for user statistics
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.username,
    u.display_name,
    u.money,
    u.level,
    u.experience_points,
    u.races_completed,
    u.races_won,
    u.podium_finishes,
    t.name as team_name,
    COUNT(DISTINCT uu.upgrade_id) as upgrades_owned,
    COALESCE(SUM(up.price), 0) as total_upgrade_value,
    CASE 
        WHEN u.races_completed > 0 THEN ROUND((u.races_won::DECIMAL / u.races_completed) * 100, 2)
        ELSE 0 
    END as win_rate_percentage
FROM users u
LEFT JOIN teams t ON u.team_id = t.id
LEFT JOIN user_upgrades uu ON u.id = uu.user_id
LEFT JOIN upgrades up ON uu.upgrade_id = up.id
WHERE u.is_active = true
GROUP BY u.id, u.username, u.display_name, u.money, u.level, u.experience_points, u.races_completed, u.races_won, u.podium_finishes, t.name;

-- Grant permissions (adjust as needed for your application user)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ftoh_app;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ftoh_app;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO ftoh_app;

COMMIT;
