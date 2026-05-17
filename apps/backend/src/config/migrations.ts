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
  }
}

export default new MigrationService();
