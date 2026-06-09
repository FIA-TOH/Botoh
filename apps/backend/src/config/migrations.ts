import { query } from './database';
import { GarageFacility, getFacilityCostPerRace } from './facilityEconomy';

class MigrationService {
  async ensureAdminSchema(): Promise<void> {
    await query('CREATE EXTENSION IF NOT EXISTS pgcrypto');

    await query(`
      CREATE TABLE IF NOT EXISTS teams (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL UNIQUE,
        tag VARCHAR(3) NOT NULL UNIQUE,
        emoji VARCHAR(8) NOT NULL DEFAULT '',
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
    await query("ALTER TABLE teams ADD COLUMN IF NOT EXISTS emoji VARCHAR(8) NOT NULL DEFAULT ''");
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
    await query('ALTER TABLE teams ADD COLUMN IF NOT EXISTS climate_monitoring_level INTEGER NOT NULL DEFAULT 0');
    await query('ALTER TABLE teams ADD COLUMN IF NOT EXISTS pit_crew_level INTEGER NOT NULL DEFAULT 0');
    await query('ALTER TABLE teams ADD COLUMN IF NOT EXISTS momento_comercial INTEGER NOT NULL DEFAULT 50');
    await query('ALTER TABLE teams ADD COLUMN IF NOT EXISTS prestigio INTEGER NOT NULL DEFAULT 1');
    await query('ALTER TABLE teams ADD COLUMN IF NOT EXISTS agressividade INTEGER NOT NULL DEFAULT 1');
    await query('ALTER TABLE teams ADD COLUMN IF NOT EXISTS popularidade INTEGER NOT NULL DEFAULT 1');
    await query('ALTER TABLE teams ADD COLUMN IF NOT EXISTS tecnica INTEGER NOT NULL DEFAULT 1');
    await query('ALTER TABLE teams ADD COLUMN IF NOT EXISTS nacionalidades TEXT[]');
    await query('ALTER TABLE teams ADD COLUMN IF NOT EXISTS manual_nacionalidades TEXT[]');
    await query('ALTER TABLE teams ADD COLUMN IF NOT EXISTS setores TEXT[]');
    await query('ALTER TABLE teams ADD COLUMN IF NOT EXISTS logo_url TEXT');
    await query(`
      UPDATE teams
      SET manual_nacionalidades = nacionalidades
      WHERE manual_nacionalidades IS NULL
        AND nacionalidades IS NOT NULL
    `);
    await query(`
      UPDATE teams
      SET nacionalidades = (
        SELECT ARRAY_AGG(nationality ORDER BY normalized)
        FROM (
          SELECT DISTINCT ON (normalized)
            nationality,
            normalized
          FROM (
            SELECT
              TRIM(value) AS nationality,
              LOWER(TRIM(value)) AS normalized
            FROM UNNEST(COALESCE(teams.manual_nacionalidades, ARRAY[]::text[])) AS value
            WHERE TRIM(value) <> ''
            UNION ALL
            SELECT
              TRIM(users.driver_nacionalidade) AS nationality,
              LOWER(TRIM(users.driver_nacionalidade)) AS normalized
            FROM team_drivers
            JOIN users ON users.id = team_drivers.user_id
            WHERE team_drivers.team_id = teams.id
              AND team_drivers.status = 'active'
              AND users.driver_wallet_created = true
              AND TRIM(COALESCE(users.driver_nacionalidade, '')) <> ''
          ) nationalities
          ORDER BY normalized, nationality
        ) unique_nationalities
      )
    `);
    await query('ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_momento_comercial_check');
    await query('ALTER TABLE teams ADD CONSTRAINT teams_momento_comercial_check CHECK (momento_comercial BETWEEN 0 AND 100)');
    await query('ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_prestigio_check');
    await query('ALTER TABLE teams ADD CONSTRAINT teams_prestigio_check CHECK (prestigio BETWEEN 1 AND 5)');
    await query('ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_agressividade_check');
    await query('ALTER TABLE teams ADD CONSTRAINT teams_agressividade_check CHECK (agressividade BETWEEN 0 AND 3)');
    await query('ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_popularidade_check');
    await query('ALTER TABLE teams ADD CONSTRAINT teams_popularidade_check CHECK (popularidade BETWEEN 0 AND 3)');
    await query('ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_tecnica_check');
    await query('ALTER TABLE teams ADD CONSTRAINT teams_tecnica_check CHECK (tecnica BETWEEN 0 AND 3)');
    await query('ALTER TABLE teams ALTER COLUMN climate_monitoring_level SET DEFAULT 0');
    await query('ALTER TABLE teams ALTER COLUMN pit_crew_level SET DEFAULT 0');
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
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS driver_wallet_created BOOLEAN NOT NULL DEFAULT false');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS driver_velocidade INTEGER');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS driver_consistencia INTEGER');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS driver_tecnica INTEGER');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS driver_experiencia INTEGER');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS driver_chuva INTEGER');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS driver_estrategia INTEGER');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS driver_potencial INTEGER');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS driver_popularidade INTEGER');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS driver_nacionalidade VARCHAR(120)');
    await query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_driver_velocidade_check');
    await query('ALTER TABLE users ADD CONSTRAINT users_driver_velocidade_check CHECK (driver_velocidade IS NULL OR driver_velocidade BETWEEN 0 AND 5)');
    await query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_driver_consistencia_check');
    await query('ALTER TABLE users ADD CONSTRAINT users_driver_consistencia_check CHECK (driver_consistencia IS NULL OR driver_consistencia BETWEEN 0 AND 5)');
    await query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_driver_tecnica_check');
    await query('ALTER TABLE users ADD CONSTRAINT users_driver_tecnica_check CHECK (driver_tecnica IS NULL OR driver_tecnica BETWEEN 0 AND 5)');
    await query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_driver_experiencia_check');
    await query('ALTER TABLE users ADD CONSTRAINT users_driver_experiencia_check CHECK (driver_experiencia IS NULL OR driver_experiencia BETWEEN 0 AND 5)');
    await query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_driver_chuva_check');
    await query('ALTER TABLE users ADD CONSTRAINT users_driver_chuva_check CHECK (driver_chuva IS NULL OR driver_chuva BETWEEN 0 AND 5)');
    await query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_driver_estrategia_check');
    await query('ALTER TABLE users ADD CONSTRAINT users_driver_estrategia_check CHECK (driver_estrategia IS NULL OR driver_estrategia BETWEEN 0 AND 5)');
    await query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_driver_potencial_check');
    await query('ALTER TABLE users ADD CONSTRAINT users_driver_potencial_check CHECK (driver_potencial IS NULL OR driver_potencial BETWEEN 0 AND 100)');
    await query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_driver_popularidade_check');
    await query('ALTER TABLE users ADD CONSTRAINT users_driver_popularidade_check CHECK (driver_popularidade IS NULL OR driver_popularidade BETWEEN 0 AND 5)');

    await query(`
      CREATE TABLE IF NOT EXISTS user_team_memberships (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        role VARCHAR(30) NOT NULL CHECK (role IN ('team_principal', 'team_assistant', 'driver', 'engineer')),
        is_team_principal BOOLEAN NOT NULL DEFAULT false,
        is_team_assistant BOOLEAN NOT NULL DEFAULT false,
        is_engineer BOOLEAN NOT NULL DEFAULT false,
        is_driver BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, team_id)
      )
    `);

    await query('ALTER TABLE user_team_memberships ADD COLUMN IF NOT EXISTS is_team_principal BOOLEAN NOT NULL DEFAULT false');
    await query('ALTER TABLE user_team_memberships ADD COLUMN IF NOT EXISTS is_team_assistant BOOLEAN NOT NULL DEFAULT false');
    await query('ALTER TABLE user_team_memberships ADD COLUMN IF NOT EXISTS is_engineer BOOLEAN NOT NULL DEFAULT false');
    await query('ALTER TABLE user_team_memberships ADD COLUMN IF NOT EXISTS is_driver BOOLEAN NOT NULL DEFAULT false');
    await query('ALTER TABLE user_team_memberships DROP CONSTRAINT IF EXISTS user_team_memberships_role_check');
    await query("ALTER TABLE user_team_memberships ADD CONSTRAINT user_team_memberships_role_check CHECK (role IN ('team_principal', 'team_assistant', 'driver', 'engineer'))");

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
        is_engineer = CASE WHEN role = 'engineer' THEN true ELSE is_engineer END,
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
    await query('ALTER TABLE team_financial_history DROP CONSTRAINT IF EXISTS team_financial_history_source_check');
    await query(`
      ALTER TABLE team_financial_history
      ADD CONSTRAINT team_financial_history_source_check
      CHECK (source IN ('manual', 'standard_race', 'sponsor', 'driver', 'facility'))
    `);
    await this.normalizeFacilityCosts();

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
    await query("ALTER TABLE team_drivers ADD COLUMN IF NOT EXISTS category VARCHAR(20) NOT NULL DEFAULT 'starter'");
    await query("ALTER TABLE team_drivers ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active'");
    await query("ALTER TABLE team_drivers ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP DEFAULT NOW()");
    await query("ALTER TABLE team_drivers DROP CONSTRAINT IF EXISTS team_drivers_category_check");
    await query("ALTER TABLE team_drivers ADD CONSTRAINT team_drivers_category_check CHECK (category IN ('starter', 'reserve'))");
    await query("ALTER TABLE team_drivers DROP CONSTRAINT IF EXISTS team_drivers_status_check");
    await query("ALTER TABLE team_drivers ADD CONSTRAINT team_drivers_status_check CHECK (status IN ('active', 'released'))");
    await query('ALTER TABLE team_drivers DROP CONSTRAINT IF EXISTS team_drivers_team_id_slot_number_key');
    await query('CREATE UNIQUE INDEX IF NOT EXISTS team_drivers_active_team_slot_unique ON team_drivers(team_id, slot_number) WHERE status = \'active\'');
    await query('CREATE UNIQUE INDEX IF NOT EXISTS team_drivers_active_user_team_unique ON team_drivers(user_id, team_id) WHERE status = \'active\' AND user_id IS NOT NULL');
    await query('CREATE UNIQUE INDEX IF NOT EXISTS team_drivers_active_starter_user_unique ON team_drivers(user_id) WHERE status = \'active\' AND category = \'starter\' AND user_id IS NOT NULL');

    await query("ALTER TABLE user_team_memberships ADD COLUMN IF NOT EXISTS driver_category VARCHAR(20)");
    await query("ALTER TABLE user_team_memberships DROP CONSTRAINT IF EXISTS user_team_memberships_driver_category_check");
    await query("ALTER TABLE user_team_memberships ADD CONSTRAINT user_team_memberships_driver_category_check CHECK (driver_category IS NULL OR driver_category IN ('starter', 'reserve'))");

    await query(`
      CREATE TABLE IF NOT EXISTS sponsors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(120) NOT NULL UNIQUE,
        logo_url TEXT,
        nacionalidade VARCHAR(120),
        tipo VARCHAR(120),
        setor VARCHAR(120),
        felicidade INTEGER NOT NULL DEFAULT 50 CHECK (felicidade BETWEEN 0 AND 100),
        prestigio INTEGER NOT NULL DEFAULT 1 CHECK (prestigio BETWEEN 1 AND 5),
        agressividade INTEGER NOT NULL DEFAULT 1 CHECK (agressividade BETWEEN 0 AND 3),
        foco_em_midia INTEGER NOT NULL DEFAULT 1 CHECK (foco_em_midia BETWEEN 0 AND 3),
        foco_tecnico INTEGER NOT NULL DEFAULT 1 CHECK (foco_tecnico BETWEEN 0 AND 3),
        nacionalismo INTEGER NOT NULL DEFAULT 1 CHECK (nacionalismo BETWEEN 0 AND 3),
        fidelidade INTEGER NOT NULL DEFAULT 1 CHECK (fidelidade BETWEEN 0 AND 3),
        orcamento INTEGER NOT NULL DEFAULT 1 CHECK (orcamento BETWEEN 0 AND 3),
        ambicao INTEGER NOT NULL DEFAULT 1 CHECK (ambicao BETWEEN 1 AND 5),
        publico_alvo_1 VARCHAR(40),
        publico_alvo_2 VARCHAR(40),
        scuderias_relacionadas UUID[],
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await query('ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS nacionalidade VARCHAR(120)');
    await query('ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS tipo VARCHAR(120)');
    await query('ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS setor VARCHAR(120)');
    await query('ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS felicidade INTEGER NOT NULL DEFAULT 50');
    await query('ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS prestigio INTEGER NOT NULL DEFAULT 1');
    await query('ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS agressividade INTEGER NOT NULL DEFAULT 1');
    await query('ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS foco_em_midia INTEGER NOT NULL DEFAULT 1');
    await query('ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS foco_tecnico INTEGER NOT NULL DEFAULT 1');
    await query('ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS nacionalismo INTEGER NOT NULL DEFAULT 1');
    await query('ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS fidelidade INTEGER NOT NULL DEFAULT 1');
    await query('ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS orcamento INTEGER NOT NULL DEFAULT 1');
    await query('ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS ambicao INTEGER NOT NULL DEFAULT 1');
    await query('ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS publico_alvo_1 VARCHAR(40)');
    await query('ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS publico_alvo_2 VARCHAR(40)');
    await query('ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS scuderias_relacionadas UUID[]');
    await query('ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS pilot_user_id UUID REFERENCES users(id) ON DELETE SET NULL');
    await query('ALTER TABLE sponsors DROP CONSTRAINT IF EXISTS sponsors_felicidade_check');
    await query('ALTER TABLE sponsors ADD CONSTRAINT sponsors_felicidade_check CHECK (felicidade BETWEEN 0 AND 100)');
    await query('ALTER TABLE sponsors DROP CONSTRAINT IF EXISTS sponsors_prestigio_check');
    await query('ALTER TABLE sponsors ADD CONSTRAINT sponsors_prestigio_check CHECK (prestigio BETWEEN 1 AND 5)');
    await query('ALTER TABLE sponsors DROP CONSTRAINT IF EXISTS sponsors_agressividade_check');
    await query('ALTER TABLE sponsors ADD CONSTRAINT sponsors_agressividade_check CHECK (agressividade BETWEEN 0 AND 3)');
    await query('ALTER TABLE sponsors DROP CONSTRAINT IF EXISTS sponsors_foco_em_midia_check');
    await query('ALTER TABLE sponsors ADD CONSTRAINT sponsors_foco_em_midia_check CHECK (foco_em_midia BETWEEN 0 AND 3)');
    await query('ALTER TABLE sponsors DROP CONSTRAINT IF EXISTS sponsors_foco_tecnico_check');
    await query('ALTER TABLE sponsors ADD CONSTRAINT sponsors_foco_tecnico_check CHECK (foco_tecnico BETWEEN 0 AND 3)');
    await query('ALTER TABLE sponsors DROP CONSTRAINT IF EXISTS sponsors_nacionalismo_check');
    await query('ALTER TABLE sponsors ADD CONSTRAINT sponsors_nacionalismo_check CHECK (nacionalismo BETWEEN 0 AND 3)');
    await query('ALTER TABLE sponsors DROP CONSTRAINT IF EXISTS sponsors_fidelidade_check');
    await query('ALTER TABLE sponsors ADD CONSTRAINT sponsors_fidelidade_check CHECK (fidelidade BETWEEN 0 AND 3)');
    await query('ALTER TABLE sponsors DROP CONSTRAINT IF EXISTS sponsors_orcamento_check');
    await query('ALTER TABLE sponsors ADD CONSTRAINT sponsors_orcamento_check CHECK (orcamento BETWEEN 0 AND 3)');
    await query('ALTER TABLE sponsors DROP CONSTRAINT IF EXISTS sponsors_ambicao_check');
    await query('ALTER TABLE sponsors ADD CONSTRAINT sponsors_ambicao_check CHECK (ambicao BETWEEN 1 AND 5)');
    await query('CREATE UNIQUE INDEX IF NOT EXISTS sponsors_pilot_user_unique ON sponsors(pilot_user_id) WHERE pilot_user_id IS NOT NULL');

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
        description TEXT,
        reward NUMERIC NOT NULL CHECK (reward >= 0),
        races_to_complete INTEGER NOT NULL CHECK (races_to_complete >= 0),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await query('ALTER TABLE team_sponsor_season_missions ADD COLUMN IF NOT EXISTS description TEXT');
    await query('ALTER TABLE team_sponsor_season_missions DROP CONSTRAINT IF EXISTS team_sponsor_season_missions_races_to_complete_check');
    await query(`
      ALTER TABLE team_sponsor_season_missions
      ADD CONSTRAINT team_sponsor_season_missions_races_to_complete_check
      CHECK (races_to_complete >= 0)
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS team_sponsor_race_missions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        team_sponsor_id UUID NOT NULL REFERENCES team_sponsors(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        reward NUMERIC NOT NULL CHECK (reward >= 0),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await query('ALTER TABLE team_sponsor_race_missions ADD COLUMN IF NOT EXISTS description TEXT');

    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        sender_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        title VARCHAR(120) NOT NULL,
        message VARCHAR(500) NOT NULL,
        type VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
        is_read BOOLEAN NOT NULL DEFAULT false,
        read_at TIMESTAMP NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await query("ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb");
    await query('CREATE INDEX IF NOT EXISTS notifications_user_created_idx ON notifications(user_id, created_at DESC)');
    await query('CREATE INDEX IF NOT EXISTS notifications_user_unread_idx ON notifications(user_id) WHERE is_read = false');

    await query(`
      CREATE TABLE IF NOT EXISTS driver_contract_proposals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        proposed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        category VARCHAR(20) NOT NULL CHECK (category IN ('starter', 'reserve')),
        contract_races INTEGER NOT NULL CHECK (contract_races > 0),
        salary_per_race NUMERIC NOT NULL CHECK (salary_per_race >= 0),
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
        notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        responded_at TIMESTAMP NULL
      )
    `);
    await query('CREATE INDEX IF NOT EXISTS driver_contract_proposals_user_status_idx ON driver_contract_proposals(user_id, status)');
    await query('CREATE INDEX IF NOT EXISTS driver_contract_proposals_team_status_idx ON driver_contract_proposals(team_id, status)');

    await query(`
      CREATE TABLE IF NOT EXISTS race_progress_alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_type VARCHAR(40) NOT NULL CHECK (
          entity_type IN ('driver_contract', 'sponsor_contract', 'season_mission')
        ),
        entity_id UUID NOT NULL,
        team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
        team_name VARCHAR(100) NOT NULL,
        entity_name VARCHAR(255) NOT NULL,
        detail VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await query('CREATE INDEX IF NOT EXISTS race_progress_alerts_created_idx ON race_progress_alerts(created_at DESC)');
  }

  private async normalizeFacilityCosts(): Promise<void> {
    await this.normalizeFacilityCost({
      facility: 'climate',
      levelColumn: 'climate_monitoring_level',
      costColumn: 'climate_cost_per_race',
    });

    await this.normalizeFacilityCost({
      facility: 'pitCrew',
      levelColumn: 'pit_crew_level',
      costColumn: 'pit_crew_cost_per_race',
    });
  }

  private async normalizeFacilityCost(args: {
    facility: GarageFacility;
    levelColumn: 'climate_monitoring_level' | 'pit_crew_level';
    costColumn: 'climate_cost_per_race' | 'pit_crew_cost_per_race';
  }): Promise<void> {
    for (let level = 0; level <= 5; level += 1) {
      const costPerRace = getFacilityCostPerRace(args.facility, level);

      await query(
        `UPDATE teams
         SET ${args.costColumn} = $1,
             updated_at = NOW()
         WHERE COALESCE(${args.levelColumn}, 0) = $2
           AND COALESCE(${args.costColumn}, 0) <> $1`,
        [costPerRace, level],
      );
    }
  }
}

export default new MigrationService();
