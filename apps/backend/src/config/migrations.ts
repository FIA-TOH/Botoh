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
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL');
    await query('ALTER TABLE users ALTER COLUMN team_id DROP NOT NULL');
  }
}

export default new MigrationService();
