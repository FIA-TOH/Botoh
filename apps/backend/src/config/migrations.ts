import { query } from './database';

class MigrationService {
  async ensureAdminSchema(): Promise<void> {
    await query('CREATE EXTENSION IF NOT EXISTS pgcrypto');

    await query(`
      CREATE TABLE IF NOT EXISTS teams (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL UNIQUE,
        tag VARCHAR(3) NOT NULL UNIQUE,
        color VARCHAR(7) NOT NULL DEFAULT '#FFFFFF',
        budget NUMERIC DEFAULT 0,
        total_wins INTEGER DEFAULT 0,
        total_races INTEGER DEFAULT 0,
        championship_points INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await query('ALTER TABLE teams ADD COLUMN IF NOT EXISTS tag VARCHAR(3)');
    await query("ALTER TABLE teams ADD COLUMN IF NOT EXISTS color VARCHAR(7) NOT NULL DEFAULT '#FFFFFF'");
    await query('ALTER TABLE teams ADD COLUMN IF NOT EXISTS budget NUMERIC DEFAULT 0');
    await query('ALTER TABLE teams ADD COLUMN IF NOT EXISTS total_wins INTEGER DEFAULT 0');
    await query('ALTER TABLE teams ADD COLUMN IF NOT EXISTS total_races INTEGER DEFAULT 0');
    await query('ALTER TABLE teams ADD COLUMN IF NOT EXISTS championship_points INTEGER DEFAULT 0');
    await query('ALTER TABLE teams ADD COLUMN IF NOT EXISTS cash_total NUMERIC NOT NULL DEFAULT 0');
    await query('ALTER TABLE teams ADD COLUMN IF NOT EXISTS climate_cost_per_race NUMERIC NOT NULL DEFAULT 0');
    await query('ALTER TABLE teams ADD COLUMN IF NOT EXISTS pit_crew_cost_per_race NUMERIC NOT NULL DEFAULT 0');
    await query('ALTER TABLE teams ADD COLUMN IF NOT EXISTS salary_cost_per_race NUMERIC NOT NULL DEFAULT 0');
    await query('ALTER TABLE teams ADD COLUMN IF NOT EXISTS sponsor_income_per_race NUMERIC NOT NULL DEFAULT 0');
    await query('ALTER TABLE teams ADD COLUMN IF NOT EXISTS climate_monitoring_level INTEGER NOT NULL DEFAULT 1');
    await query('ALTER TABLE teams ADD COLUMN IF NOT EXISTS pit_crew_level INTEGER NOT NULL DEFAULT 1');
    await query("ALTER TABLE teams ADD COLUMN IF NOT EXISTS car_name VARCHAR(100) NOT NULL DEFAULT 'Unnamed car'");
    await query('ALTER TABLE teams ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()');
    await query('ALTER TABLE teams ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()');

    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(30) DEFAULT \'user\'');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS money NUMERIC DEFAULT 50000');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS short_username VARCHAR(3)');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_team_principal BOOLEAN DEFAULT false');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_team_assistant BOOLEAN DEFAULT false');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_driver BOOLEAN DEFAULT false');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS driver_number INTEGER');
    await query("ALTER TABLE users ADD COLUMN IF NOT EXISTS language VARCHAR(2) NOT NULL DEFAULT 'pt'");
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL');
    await query('ALTER TABLE users ALTER COLUMN team_id DROP NOT NULL');

    await query(`
      CREATE TABLE IF NOT EXISTS user_team_memberships (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        role VARCHAR(30) NOT NULL CHECK (role IN ('team_principal', 'team_assistant', 'driver')),
        is_team_principal BOOLEAN NOT NULL DEFAULT false,
        is_team_assistant BOOLEAN NOT NULL DEFAULT false,
        is_driver BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, team_id)
      )
    `);

    await query('ALTER TABLE user_team_memberships ADD COLUMN IF NOT EXISTS is_team_principal BOOLEAN NOT NULL DEFAULT false');
    await query('ALTER TABLE user_team_memberships ADD COLUMN IF NOT EXISTS is_team_assistant BOOLEAN NOT NULL DEFAULT false');
    await query('ALTER TABLE user_team_memberships ADD COLUMN IF NOT EXISTS is_driver BOOLEAN NOT NULL DEFAULT false');

    await query(`
      INSERT INTO user_team_memberships (
        user_id,
        team_id,
        role,
        is_team_principal,
        is_team_assistant,
        is_driver
      )
      SELECT
        u.id,
        u.team_id,
        CASE
          WHEN COALESCE(u.is_team_principal, false) THEN 'team_principal'
          WHEN COALESCE(u.is_team_assistant, false) THEN 'team_assistant'
          ELSE 'driver'
        END,
        COALESCE(u.is_team_principal, false),
        COALESCE(u.is_team_assistant, false),
        COALESCE(u.is_driver, false)
      FROM users u
      WHERE u.team_id IS NOT NULL
      ON CONFLICT (user_id, team_id) DO NOTHING
    `);

    await query(`
      UPDATE user_team_memberships
      SET
        is_team_principal = CASE WHEN role = 'team_principal' THEN true ELSE is_team_principal END,
        is_team_assistant = CASE WHEN role = 'team_assistant' THEN true ELSE is_team_assistant END,
        is_driver = CASE WHEN role = 'driver' THEN true ELSE is_driver END
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS team_financial_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        amount NUMERIC NOT NULL,
        entry_type VARCHAR(20) NOT NULL CHECK (entry_type IN ('income', 'expense')),
        reason VARCHAR(255) NOT NULL,
        source VARCHAR(30) NOT NULL DEFAULT 'manual'
          CHECK (source IN ('manual', 'standard_race', 'sponsor', 'driver', 'facility')),
        race_id UUID NULL,
        occurred_at TIMESTAMP NOT NULL DEFAULT NOW(),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS team_drivers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        display_name VARCHAR(100) NOT NULL,
        driver_number INTEGER,
        contract_ends_after_races INTEGER NOT NULL CHECK (contract_ends_after_races >= 0),
        salary_per_race NUMERIC NOT NULL CHECK (salary_per_race >= 0),
        slot_number INTEGER NOT NULL CHECK (slot_number BETWEEN 1 AND 4),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(team_id, slot_number)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS sponsors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(120) NOT NULL UNIQUE,
        logo_url TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS team_sponsors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        sponsor_id UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
        category VARCHAR(30) NOT NULL CHECK (
          category IN ('title_sponsor', 'main_partner', 'official_partner', 'minor_sponsor', 'personal_sponsor')
        ),
        slot_number INTEGER NOT NULL,
        contract_races_remaining INTEGER NOT NULL CHECK (contract_races_remaining >= 0),
        initial_reward NUMERIC NOT NULL DEFAULT 0 CHECK (initial_reward >= 0),
        reward_per_race NUMERIC NOT NULL DEFAULT 0 CHECK (reward_per_race >= 0),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(team_id, category, slot_number),
        CHECK (
          (category = 'title_sponsor' AND slot_number BETWEEN 1 AND 1)
          OR (category = 'main_partner' AND slot_number BETWEEN 1 AND 2)
          OR (category = 'official_partner' AND slot_number BETWEEN 1 AND 4)
          OR (category = 'minor_sponsor' AND slot_number BETWEEN 1 AND 8)
          OR (category = 'personal_sponsor' AND slot_number BETWEEN 1 AND 4)
        )
      )
    `);
    await query(`
      DELETE FROM team_sponsors duplicate
      USING team_sponsors keeper
      WHERE duplicate.team_id = keeper.team_id
        AND duplicate.sponsor_id = keeper.sponsor_id
        AND duplicate.created_at > keeper.created_at
    `);
    await query('CREATE UNIQUE INDEX IF NOT EXISTS team_sponsors_team_sponsor_unique ON team_sponsors(team_id, sponsor_id)');

    await query(`
      CREATE TABLE IF NOT EXISTS team_sponsor_season_missions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        team_sponsor_id UUID NOT NULL REFERENCES team_sponsors(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        reward NUMERIC NOT NULL CHECK (reward >= 0),
        races_to_complete INTEGER NOT NULL CHECK (races_to_complete > 0),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS team_sponsor_race_missions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        team_sponsor_id UUID NOT NULL REFERENCES team_sponsors(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        reward NUMERIC NOT NULL CHECK (reward >= 0),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
  }
}

export default new MigrationService();
