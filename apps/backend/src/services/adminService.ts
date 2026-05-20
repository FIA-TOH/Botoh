import authService from './authService';
import { query, queryOne, transaction } from '../config/database';
import garageService from './garageService';

export type TeamMembershipRole = 'team_principal' | 'team_assistant' | 'driver';

export interface TeamMembershipInput {
  teamId: string;
  roles: TeamMembershipRole[];
  driverCategory?: 'starter' | 'reserve' | null;
  contractRaces?: number | null;
  salaryPerRace?: number | null;
}

export interface AdminUserInput {
  username: string;
  password?: string;
  shortUsername: string;
  teamMemberships: TeamMembershipInput[];
  driverNumber: number;
  language: 'pt' | 'en' | 'es';
}

export interface ScuderiaInput {
  name: string;
  tag: string;
  color: string;
}

export interface TeamFinanceEntryInput {
  amount: number;
  entryType: 'income' | 'expense';
  reason: string;
  occurredAt?: string;
}

export interface TeamSponsorInput {
  sponsorId: string;
  category: 'title_sponsor' | 'main_partner' | 'official_partner' | 'minor_sponsor' | 'personal_sponsor';
  contractRacesRemaining: number;
  initialReward: number;
  rewardPerRace: number;
}

export interface SponsorMissionInput {
  title: string;
  reward: number;
  racesToComplete?: number;
}

export interface SponsorInput {
  name: string;
  logoUrl: string;
}

type RaceProgressDirection = 'advance' | 'rollback';

export interface AdminDriverInput {
  username: string;
  category: 'starter' | 'reserve';
  contractRaces: number;
  salaryPerRace: number;
}

class AdminService {
  async listUsers() {
    const result = await query(`
      SELECT
        u.id,
        u.username,
        u.role,
        u.money,
        u.short_username AS "shortUsername",
        BOOL_OR(COALESCE(utm.is_team_principal, false)) AS "teamPrincipal",
        BOOL_OR(COALESCE(utm.is_team_assistant, false)) AS "teamAssistant",
        BOOL_OR(COALESCE(utm.is_driver, false)) AS "driver",
        COALESCE(
          json_agg(
            json_build_object(
              'teamId', t.id,
              'teamName', t.name,
              'teamTag', t.tag,
              'teamColor', t.color,
              'roles', ARRAY_REMOVE(ARRAY[
                CASE WHEN utm.is_team_principal THEN 'team_principal' END,
                CASE WHEN utm.is_team_assistant THEN 'team_assistant' END,
                CASE WHEN utm.is_driver THEN 'driver' END
              ], NULL),
              'driverCategory', active_driver.category,
              'contractRaces', active_driver.contract_ends_after_races,
              'salaryPerRace', active_driver.salary_per_race
            )
            ORDER BY t.name
          ) FILTER (WHERE utm.team_id IS NOT NULL),
          '[]'::json
        ) AS "teamMemberships",
        u.driver_number AS "driverNumber",
        u.language,
        u.created_at AS "createdAt"
      FROM users u
      LEFT JOIN user_team_memberships utm ON utm.user_id = u.id
      LEFT JOIN teams t ON utm.team_id = t.id
      LEFT JOIN LATERAL (
        SELECT category, contract_ends_after_races, salary_per_race
        FROM team_drivers td
        WHERE td.user_id = u.id
          AND td.team_id = utm.team_id
          AND td.status = 'active'
        ORDER BY td.accepted_at DESC NULLS LAST, td.created_at DESC
        LIMIT 1
      ) active_driver ON true
      WHERE COALESCE(u.is_active, true) = true
      GROUP BY u.id
      ORDER BY u.username ASC
    `);

    return result.rows;
  }

  async createUser(input: Required<AdminUserInput>) {
    const existingUser = await authService.findUserByUsername(input.username);
    if (existingUser) {
      return { success: false, message: 'Username already exists' };
    }

    const passwordHash = await authService.hashPassword(input.password);
    const validation = await this.validateDriverMemberships(input.teamMemberships);
    if (!validation.success) return validation;

    const user = await transaction(async (client) => {
      const result = await client.query(
        `INSERT INTO users (
          username,
          password_hash,
          role,
          money,
          short_username,
          is_team_principal,
          is_team_assistant,
          is_driver,
          team_id,
          driver_number,
          language,
          is_active,
          created_at
        ) VALUES ($1, $2, 'user', 50000, $3, $4, $5, $6, $7, $8, $9, true, NOW())
        RETURNING id`,
        [
          input.username,
          passwordHash,
          input.shortUsername,
          this.hasAnyRole(input.teamMemberships, 'team_principal'),
          this.hasAnyRole(input.teamMemberships, 'team_assistant'),
          this.hasAnyRole(input.teamMemberships, 'driver'),
          input.teamMemberships[0]?.teamId ?? null,
          input.driverNumber,
          input.language,
        ],
      );

      const createdUser = result.rows[0];
      await this.replaceMemberships(client, createdUser.id, input);
      return createdUser;
    });

    return { success: true, user };
  }

  async updateUser(userId: string, input: AdminUserInput) {
    const usernameOwner = await authService.findUserByUsername(input.username);
    if (usernameOwner && usernameOwner.id !== userId) {
      return { success: false, message: 'Username already exists' };
    }

    const validation = await this.validateDriverMemberships(input.teamMemberships, userId);
    if (!validation.success) return validation;

    const values: any[] = [
      input.username,
      input.shortUsername,
      this.hasAnyRole(input.teamMemberships, 'team_principal'),
      this.hasAnyRole(input.teamMemberships, 'team_assistant'),
      this.hasAnyRole(input.teamMemberships, 'driver'),
      input.teamMemberships[0]?.teamId ?? null,
      input.driverNumber,
      input.language,
      userId,
    ];

    let passwordSql = '';
    if (input.password) {
      values.splice(8, 0, await authService.hashPassword(input.password));
      passwordSql = ', password_hash = $9';
      values[9] = userId;
    }

    const result = await transaction(async (client) => {
      const updated = await client.query(
        `UPDATE users
         SET
          username = $1,
          short_username = $2,
          is_team_principal = $3,
          is_team_assistant = $4,
          is_driver = $5,
          team_id = $6,
          driver_number = $7,
          language = $8
          ${passwordSql}
         WHERE id = $${input.password ? 10 : 9}
         RETURNING id`,
        values,
      );

      if (updated.rows[0]) {
        await this.replaceMemberships(client, userId, input);
      }

      return updated;
    });

    if (!result.rows[0]) {
      return { success: false, message: 'User not found' };
    }

    return { success: true, user: result.rows[0] };
  }

  async deleteUser(userId: string) {
    const result = await query(
      'UPDATE users SET is_active = false WHERE id = $1 RETURNING id',
      [userId],
    );

    if (!result.rows[0]) {
      return { success: false, message: 'User not found' };
    }

    return { success: true };
  }

  private async replaceMemberships(
    client: { query: (sql: string, params?: any[]) => Promise<any> },
    userId: string,
    input: Pick<AdminUserInput, 'teamMemberships' | 'username' | 'driverNumber'>,
  ) {
    const memberships = input.teamMemberships;
    const previousTeams = await client.query(
      `SELECT team_id
       FROM user_team_memberships
       WHERE user_id = $1
         AND is_driver = true`,
      [userId],
    );

    await client.query('DELETE FROM user_team_memberships WHERE user_id = $1', [userId]);

    for (const membership of memberships) {
      const primaryRole = membership.roles[0] ?? 'driver';
      const isDriver = membership.roles.includes('driver');
      const driverCategory = isDriver ? (membership.driverCategory ?? 'reserve') : null;
      await client.query(
        `INSERT INTO user_team_memberships (
          user_id,
          team_id,
          role,
          is_team_principal,
          is_team_assistant,
          is_driver,
          driver_category
        )
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          userId,
          membership.teamId,
          primaryRole,
          membership.roles.includes('team_principal'),
          membership.roles.includes('team_assistant'),
          isDriver,
          driverCategory,
        ],
      );

      if (isDriver) {
        await this.upsertTeamDriver(client, membership.teamId, userId, {
          username: input.username,
          category: driverCategory ?? 'reserve',
          contractRaces: Number(membership.contractRaces ?? 1),
          salaryPerRace: Number(membership.salaryPerRace ?? 0),
        }, input.driverNumber);
      }
    }

    const nextDriverTeamIds = new Set(
      memberships
        .filter((membership) => membership.roles.includes('driver'))
        .map((membership) => membership.teamId),
    );
    for (const row of previousTeams.rows) {
      if (nextDriverTeamIds.has(row.team_id)) continue;
      await this.removeTeamDriverContract(client, row.team_id, userId);
    }

    const affectedTeamIds = new Set<string>([
      ...previousTeams.rows.map((row: any) => row.team_id),
      ...memberships.map((membership) => membership.teamId),
    ]);
    for (const teamId of affectedTeamIds) {
      await this.recalculateTeamSalaryCost(client, teamId);
    }
  }

  private hasAnyRole(memberships: TeamMembershipInput[], role: TeamMembershipRole) {
    return memberships.some((membership) => membership.roles.includes(role));
  }

  private async validateDriverMemberships(memberships: TeamMembershipInput[], userId?: string) {
    const driverMemberships = memberships.filter((membership) => membership.roles.includes('driver'));
    const starterMemberships = driverMemberships.filter((membership) => (membership.driverCategory ?? 'reserve') === 'starter');

    if (starterMemberships.length > 1) {
      return { success: false, message: 'Driver already has a starter contract' };
    }

    for (const membership of driverMemberships) {
      const category = membership.driverCategory ?? 'reserve';
      const validation = await this.validateDriverAssignment(membership.teamId, userId, category);
      if (!validation.success) return validation;
    }

    return { success: true };
  }

  private async validateDriverAssignment(
    teamId: string,
    userId: string | undefined,
    category: 'starter' | 'reserve',
    currentDriverId?: string,
  ) {
    const categoryCount = await queryOne<{ count: number }>(
      `SELECT COUNT(*)::int AS count
       FROM team_drivers
       WHERE team_id = $1
         AND category = $2
         AND status = 'active'
         AND ($3::uuid IS NULL OR id <> $3::uuid)
         AND ($4::uuid IS NULL OR user_id <> $4::uuid)`,
      [teamId, category, currentDriverId ?? null, userId ?? null],
    );
    if (Number(categoryCount?.count ?? 0) >= 2) {
      return { success: false, message: 'Driver category is full' };
    }

    if (category === 'starter' && userId) {
      const starterContract = await queryOne(
        `SELECT id
         FROM team_drivers
         WHERE user_id = $1
           AND category = 'starter'
           AND status = 'active'
           AND team_id <> $2
           AND ($3::uuid IS NULL OR id <> $3::uuid)`,
        [userId, teamId, currentDriverId ?? null],
      );
      if (starterContract) return { success: false, message: 'Driver already has a starter contract' };
    }

    return { success: true };
  }

  private async findActiveUserByUsername(username: string) {
    return queryOne<{ id: string; username: string; driver_number: number | null }>(
      `SELECT id, username, driver_number
       FROM users
       WHERE LOWER(username) = LOWER($1)
         AND COALESCE(is_active, true) = true
       LIMIT 1`,
      [username],
    );
  }

  private async findAvailableDriverSlot(
    client: { query: (sql: string, params?: any[]) => Promise<any> },
    teamId: string,
    category: 'starter' | 'reserve',
    currentDriverId?: string,
  ) {
    const baseSlot = category === 'starter' ? 1 : 3;
    const occupied = await client.query(
      `SELECT slot_number
       FROM team_drivers
       WHERE team_id = $1
         AND category = $2
         AND status = 'active'
         AND ($3::uuid IS NULL OR id <> $3::uuid)`,
      [teamId, category, currentDriverId ?? null],
    );
    const used = new Set(occupied.rows.map((row: any) => Number(row.slot_number)));
    const slot = [baseSlot, baseSlot + 1].find((candidate) => !used.has(candidate));
    if (!slot) throw new Error('Driver category is full');
    return slot;
  }

  private async upsertTeamDriver(
    client: { query: (sql: string, params?: any[]) => Promise<any> },
    teamId: string,
    userId: string,
    input: AdminDriverInput,
    driverNumber: number | null,
  ) {
    const existing = await client.query(
      `SELECT id
       FROM team_drivers
       WHERE team_id = $1
         AND user_id = $2
         AND status = 'active'
       LIMIT 1`,
      [teamId, userId],
    );
    const slotNumber = await this.findAvailableDriverSlot(
      client,
      teamId,
      input.category,
      existing.rows[0]?.id,
    );
    await client.query(
      `INSERT INTO team_drivers (
        team_id,
        user_id,
        display_name,
        driver_number,
        contract_ends_after_races,
        salary_per_race,
        slot_number,
        category,
        status,
        accepted_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', NOW())
      ON CONFLICT (user_id, team_id) WHERE status = 'active' AND user_id IS NOT NULL
      DO UPDATE SET
        display_name = EXCLUDED.display_name,
        driver_number = EXCLUDED.driver_number,
        contract_ends_after_races = EXCLUDED.contract_ends_after_races,
        salary_per_race = EXCLUDED.salary_per_race,
        slot_number = EXCLUDED.slot_number,
        category = EXCLUDED.category,
        updated_at = NOW()`,
      [
        teamId,
        userId,
        input.username,
        driverNumber,
        input.contractRaces,
        input.salaryPerRace,
        slotNumber,
        input.category,
      ],
    );
  }

  private async removeTeamDriverContract(
    client: { query: (sql: string, params?: any[]) => Promise<any> },
    teamId: string,
    userId: string,
  ) {
    await client.query(
      `UPDATE team_drivers
       SET status = 'released',
           updated_at = NOW()
       WHERE team_id = $1
         AND user_id = $2
         AND status = 'active'`,
      [teamId, userId],
    );
  }

  private async upsertDriverMembership(
    client: { query: (sql: string, params?: any[]) => Promise<any> },
    userId: string,
    teamId: string,
    category: 'starter' | 'reserve',
  ) {
    await client.query(
      `INSERT INTO user_team_memberships (
        user_id,
        team_id,
        role,
        is_team_principal,
        is_team_assistant,
        is_driver,
        driver_category
      ) VALUES ($1, $2, 'driver', false, false, true, $3)
      ON CONFLICT (user_id, team_id)
      DO UPDATE SET
        is_driver = true,
        driver_category = EXCLUDED.driver_category,
        role = CASE
          WHEN user_team_memberships.is_team_principal THEN user_team_memberships.role
          WHEN user_team_memberships.is_team_assistant THEN user_team_memberships.role
          ELSE 'driver'
        END`,
      [userId, teamId, category],
    );
  }

  private async removeDriverMembershipIfNeeded(
    client: { query: (sql: string, params?: any[]) => Promise<any> },
    userId: string,
    teamId: string,
  ) {
    const remaining = await client.query(
      `SELECT id
       FROM team_drivers
       WHERE user_id = $1
         AND team_id = $2
         AND status = 'active'`,
      [userId, teamId],
    );
    if (remaining.rows[0]) return;

    const membership = await client.query(
      `SELECT is_team_principal, is_team_assistant
       FROM user_team_memberships
       WHERE user_id = $1
         AND team_id = $2`,
      [userId, teamId],
    );
    const row = membership.rows[0];
    if (!row) return;

    if (!row.is_team_principal && !row.is_team_assistant) {
      await client.query(
        'DELETE FROM user_team_memberships WHERE user_id = $1 AND team_id = $2',
        [userId, teamId],
      );
      return;
    }

    await client.query(
      `UPDATE user_team_memberships
       SET is_driver = false,
           driver_category = null,
           role = CASE WHEN is_team_principal THEN 'team_principal' ELSE 'team_assistant' END
       WHERE user_id = $1
         AND team_id = $2`,
      [userId, teamId],
    );
  }

  private async recalculateTeamSalaryCost(
    client: { query: (sql: string, params?: any[]) => Promise<any> },
    teamId: string,
  ) {
    await client.query(
      `UPDATE teams
       SET salary_cost_per_race = COALESCE(
         (
          SELECT SUM(salary_per_race)
          FROM team_drivers
          WHERE team_id = $1
            AND status = 'active'
         ),
         0
       ),
       updated_at = NOW()
       WHERE id = $1`,
      [teamId],
    );
  }

  private async recalculateTeamSponsorIncome(
    client: { query: (sql: string, params?: any[]) => Promise<any> },
    teamId: string,
  ) {
    await client.query(
      `UPDATE teams
       SET sponsor_income_per_race = COALESCE(
         (
          SELECT SUM(reward_per_race)
          FROM team_sponsors
          WHERE team_id = $1
         ),
         0
       ),
       updated_at = NOW()
       WHERE id = $1`,
      [teamId],
    );
  }

  async listScuderias() {
    const result = await query(`
      SELECT id, name, tag, color, created_at AS "createdAt"
      FROM teams
      ORDER BY name ASC
    `);

    return result.rows;
  }

  async createScuderia(input: ScuderiaInput) {
    const existing = await queryOne(
      'SELECT id FROM teams WHERE LOWER(name) = LOWER($1) OR UPPER(tag) = UPPER($2)',
      [input.name, input.tag],
    );

    if (existing) {
      return { success: false, message: 'Scuderia name or abbreviation already exists' };
    }

    const result = await query(
      `INSERT INTO teams (
        name,
        tag,
        color,
        climate_monitoring_level,
        pit_crew_level,
        climate_cost_per_race,
        pit_crew_cost_per_race,
        created_at,
        updated_at
      )
       VALUES ($1, $2, $3, 0, 0, 0, 0, NOW(), NOW())
       RETURNING id`,
      [input.name, input.tag.toUpperCase(), input.color],
    );

    return { success: true, scuderia: result.rows[0] };
  }

  async updateScuderia(scuderiaId: string, input: ScuderiaInput) {
    const result = await query(
      `UPDATE teams
       SET name = $1, tag = $2, color = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING id`,
      [input.name, input.tag.toUpperCase(), input.color, scuderiaId],
    );

    if (!result.rows[0]) {
      return { success: false, message: 'Scuderia not found' };
    }

    return { success: true, scuderia: result.rows[0] };
  }

  async deleteScuderia(scuderiaId: string) {
    const result = await query('DELETE FROM teams WHERE id = $1 RETURNING id', [
      scuderiaId,
    ]);

    if (!result.rows[0]) {
      return { success: false, message: 'Scuderia not found' };
    }

    return { success: true };
  }

  async addTeamFinanceEntry(scuderiaId: string, input: TeamFinanceEntryInput) {
    const team = await queryOne('SELECT id FROM teams WHERE id = $1', [scuderiaId]);
    if (!team) {
      return { success: false, message: 'Scuderia not found' };
    }

    const signedAmount = input.entryType === 'income'
      ? Math.abs(input.amount)
      : -Math.abs(input.amount);

    const result = await transaction(async (client) => {
      const history = await client.query(
        `INSERT INTO team_financial_history (
          team_id,
          amount,
          entry_type,
          reason,
          source,
          occurred_at
        ) VALUES ($1, $2, $3, $4, 'manual', COALESCE($5::timestamp, NOW()))
        RETURNING id`,
        [
          scuderiaId,
          Math.abs(input.amount),
          input.entryType,
          input.reason,
          input.occurredAt ?? null,
        ],
      );

      await client.query(
        `UPDATE teams
         SET cash_total = cash_total + $1,
             updated_at = NOW()
         WHERE id = $2`,
        [signedAmount, scuderiaId],
      );

      return history.rows[0];
    });

    return { success: true, entry: result };
  }

  async getScuderiaManagement(scuderiaId: string) {
    return garageService.getTeamGarage(scuderiaId);
  }

  async listRaceProgressAlerts() {
    const result = await query(
      `SELECT
        id,
        entity_type AS "entityType",
        entity_id AS "entityId",
        team_id AS "teamId",
        team_name AS "teamName",
        entity_name AS "entityName",
        detail,
        created_at AS "createdAt"
       FROM race_progress_alerts
       ORDER BY created_at DESC
       LIMIT 200`,
    );

    return result.rows;
  }

  async clearRaceProgressAlerts() {
    await query('DELETE FROM race_progress_alerts');
    return { success: true };
  }

  async progressRace(direction: RaceProgressDirection) {
    const step = direction === 'advance' ? -1 : 1;
    const financeMultiplier = direction === 'advance' ? 1 : -1;

    return transaction(async (client) => {
      const teams = await client.query(
        `SELECT
          id,
          name,
          climate_cost_per_race,
          pit_crew_cost_per_race,
          salary_cost_per_race,
          sponsor_income_per_race
         FROM teams
         ORDER BY name ASC
         FOR UPDATE`,
      );

      for (const team of teams.rows) {
        const sponsorIncome = Number(team.sponsor_income_per_race);
        const climateCost = Number(team.climate_cost_per_race);
        const pitCrewCost = Number(team.pit_crew_cost_per_race);
        const salaryCost = Number(team.salary_cost_per_race);
        const net = sponsorIncome - climateCost - pitCrewCost - salaryCost;
        const cashDelta = net * financeMultiplier;

        await client.query(
          `UPDATE teams
           SET cash_total = cash_total + $1,
               total_races = GREATEST(total_races + $2, 0),
               updated_at = NOW()
           WHERE id = $3`,
          [cashDelta, direction === 'advance' ? 1 : -1, team.id],
        );

        if (cashDelta !== 0) {
          await client.query(
            `INSERT INTO team_financial_history (team_id, amount, entry_type, reason, source)
             VALUES ($1, $2, $3, $4, 'standard_race')`,
            [
              team.id,
              Math.abs(cashDelta),
              cashDelta >= 0 ? 'income' : 'expense',
              direction === 'advance' ? 'Race progress' : 'Race rollback',
            ],
          );
        }
      }

      if (direction === 'advance') {
        await this.createRaceProgressAlerts(client);
      }

      await client.query(
        `UPDATE team_drivers
         SET contract_ends_after_races = GREATEST(contract_ends_after_races + $1, 0),
             updated_at = NOW()
         WHERE status = 'active'`,
        [step],
      );
      await client.query(
        `UPDATE team_sponsors
         SET contract_races_remaining = GREATEST(contract_races_remaining + $1, 0),
             updated_at = NOW()`,
        [step],
      );
      await client.query(
        `UPDATE team_sponsor_season_missions
         SET races_to_complete = GREATEST(races_to_complete + $1, 0)`,
        [step],
      );

      return { success: true };
    });
  }

  private async createRaceProgressAlerts(client: { query: (sql: string, params?: any[]) => Promise<any> }) {
    await client.query(
      `INSERT INTO race_progress_alerts (
        entity_type,
        entity_id,
        team_id,
        team_name,
        entity_name,
        detail
      )
      SELECT
        'driver_contract',
        td.id,
        t.id,
        t.name,
        td.display_name,
        td.display_name
      FROM team_drivers td
      JOIN teams t ON t.id = td.team_id
      WHERE td.status = 'active'
        AND td.contract_ends_after_races = 1`,
    );

    await client.query(
      `INSERT INTO race_progress_alerts (
        entity_type,
        entity_id,
        team_id,
        team_name,
        entity_name,
        detail
      )
      SELECT
        'sponsor_contract',
        ts.id,
        t.id,
        t.name,
        s.name,
        s.name
      FROM team_sponsors ts
      JOIN teams t ON t.id = ts.team_id
      JOIN sponsors s ON s.id = ts.sponsor_id
      WHERE ts.contract_races_remaining = 1`,
    );

    await client.query(
      `INSERT INTO race_progress_alerts (
        entity_type,
        entity_id,
        team_id,
        team_name,
        entity_name,
        detail
      )
      SELECT
        'season_mission',
        sm.id,
        t.id,
        t.name,
        sm.title,
        s.name || ' - ' || sm.title
      FROM team_sponsor_season_missions sm
      JOIN team_sponsors ts ON ts.id = sm.team_sponsor_id
      JOIN sponsors s ON s.id = ts.sponsor_id
      JOIN teams t ON t.id = ts.team_id
      WHERE sm.races_to_complete = 1`,
    );
  }

  async addScuderiaDriver(scuderiaId: string, input: AdminDriverInput) {
    const user = await this.findActiveUserByUsername(input.username);
    if (!user) return { success: false, message: 'Driver user not found' };

    const validation = await this.validateDriverAssignment(scuderiaId, user.id, input.category);
    if (!validation.success) return validation;

    return transaction(async (client) => {
      await this.upsertTeamDriver(client, scuderiaId, user.id, input, user.driver_number);
      await this.upsertDriverMembership(client, user.id, scuderiaId, input.category);
      await this.recalculateTeamSalaryCost(client, scuderiaId);
      return { success: true };
    });
  }

  async updateScuderiaDriver(scuderiaId: string, driverId: string, input: Omit<AdminDriverInput, 'username'>) {
    const existing = await queryOne<{ user_id: string }>(
      `SELECT user_id
       FROM team_drivers
       WHERE id = $1
         AND team_id = $2
         AND status = 'active'`,
      [driverId, scuderiaId],
    );
    if (!existing?.user_id) return { success: false, message: 'Driver contract not found' };

    const validation = await this.validateDriverAssignment(scuderiaId, existing.user_id, input.category, driverId);
    if (!validation.success) return validation;

    return transaction(async (client) => {
      const slotNumber = await this.findAvailableDriverSlot(client, scuderiaId, input.category, driverId);
      await client.query(
        `UPDATE team_drivers
         SET category = $1,
             contract_ends_after_races = $2,
             salary_per_race = $3,
             slot_number = $4,
             updated_at = NOW()
         WHERE id = $5
           AND team_id = $6`,
        [input.category, input.contractRaces, input.salaryPerRace, slotNumber, driverId, scuderiaId],
      );
      await this.upsertDriverMembership(client, existing.user_id, scuderiaId, input.category);
      await this.recalculateTeamSalaryCost(client, scuderiaId);
      return { success: true };
    });
  }

  async removeScuderiaDriver(scuderiaId: string, driverId: string) {
    return transaction(async (client) => {
      const existing = await client.query(
        `SELECT user_id
         FROM team_drivers
         WHERE id = $1
           AND team_id = $2
           AND status = 'active'`,
        [driverId, scuderiaId],
      );
      const row = existing.rows[0];
      if (!row) return { success: false, message: 'Driver contract not found' };

      await client.query(
        `UPDATE team_drivers
         SET status = 'released',
             updated_at = NOW()
         WHERE id = $1`,
        [driverId],
      );
      if (row.user_id) {
        await this.removeDriverMembershipIfNeeded(client, row.user_id, scuderiaId);
      }
      await this.recalculateTeamSalaryCost(client, scuderiaId);
      return { success: true };
    });
  }

  async updateScuderiaCarName(scuderiaId: string, carName: string | null) {
    const result = await query(
      `UPDATE teams
       SET car_name = COALESCE(NULLIF($1, ''), 'Unnamed car'),
           updated_at = NOW()
       WHERE id = $2
       RETURNING id`,
      [carName, scuderiaId],
    );
    return result.rows[0]
      ? { success: true }
      : { success: false, message: 'Scuderia not found' };
  }

  async listSponsors() {
    const result = await query(
      `SELECT id, name, logo_url AS "logoUrl"
       FROM sponsors
       ORDER BY name ASC`,
    );
    return result.rows;
  }

  async createSponsor(input: SponsorInput) {
    const result = await query(
      `INSERT INTO sponsors (name, logo_url, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())
       RETURNING id`,
      [input.name, input.logoUrl],
    );
    return { success: true, sponsor: result.rows[0] };
  }

  async updateSponsor(sponsorId: string, input: SponsorInput) {
    const result = await query(
      `UPDATE sponsors
       SET name = $1,
           logo_url = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING id`,
      [input.name, input.logoUrl, sponsorId],
    );
    return result.rows[0]
      ? { success: true }
      : { success: false, message: 'Sponsor not found' };
  }

  async deleteSponsor(sponsorId: string) {
    const result = await query('DELETE FROM sponsors WHERE id = $1 RETURNING id', [sponsorId]);
    return result.rows[0]
      ? { success: true }
      : { success: false, message: 'Sponsor not found' };
  }

  async addTeamSponsor(scuderiaId: string, input: TeamSponsorInput) {
    return transaction(async (client) => {
      const sponsor = await client.query(
        'SELECT id, name FROM sponsors WHERE id = $1',
        [input.sponsorId],
      );
      if (!sponsor.rows[0]) {
        return { success: false, message: 'Sponsor not found' };
      }

      const existing = await client.query(
        'SELECT id FROM team_sponsors WHERE team_id = $1 AND sponsor_id = $2',
        [scuderiaId, input.sponsorId],
      );
      if (existing.rows[0]) {
        return { success: false, message: 'Sponsor already assigned to scuderia' };
      }

      const limits = {
        title_sponsor: 1,
        main_partner: 2,
        official_partner: 4,
        minor_sponsor: 8,
        personal_sponsor: 4,
      };
      const occupiedSlots = await client.query(
        `SELECT slot_number
         FROM team_sponsors
         WHERE team_id = $1 AND category = $2
         ORDER BY slot_number ASC`,
        [scuderiaId, input.category],
      );
      if (occupiedSlots.rows.length >= limits[input.category]) {
        return { success: false, message: 'Sponsor category is full' };
      }
      const usedSlots = new Set(occupiedSlots.rows.map((row: any) => Number(row.slot_number)));
      const slotNumber = Array.from({ length: limits[input.category] }, (_, index) => index + 1)
        .find((slot) => !usedSlots.has(slot));

      const result = await client.query(
        `INSERT INTO team_sponsors (
          team_id, sponsor_id, category, slot_number,
          contract_races_remaining, initial_reward, reward_per_race
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id`,
        [
          scuderiaId,
          input.sponsorId,
          input.category,
          slotNumber,
          input.contractRacesRemaining,
          input.initialReward,
          input.rewardPerRace,
        ],
      );

      await client.query(
        `UPDATE teams
         SET cash_total = cash_total + $1,
             sponsor_income_per_race = COALESCE(
               (
                 SELECT SUM(reward_per_race)
                 FROM team_sponsors
                 WHERE team_id = $2
               ),
               0
             ),
             updated_at = NOW()
         WHERE id = $2`,
        [input.initialReward, scuderiaId],
      );
      await client.query(
        `INSERT INTO team_financial_history (team_id, amount, entry_type, reason, source)
         VALUES ($1, $2, 'income', $3, 'sponsor')`,
        [scuderiaId, input.initialReward, sponsor.rows[0].name],
      );

      return { success: true, teamSponsor: result.rows[0] };
    });
  }

  async updateTeamSponsor(teamSponsorId: string, input: Omit<TeamSponsorInput, 'sponsorId'>) {
    const existing = await queryOne('SELECT team_id FROM team_sponsors WHERE id = $1', [teamSponsorId]);
    if (!existing) {
      return { success: false, message: 'Team sponsor not found' };
    }
    const limits = {
      title_sponsor: 1,
      main_partner: 2,
      official_partner: 4,
      minor_sponsor: 8,
      personal_sponsor: 4,
    };
    const occupiedSlots = await query(
      `SELECT slot_number
       FROM team_sponsors
       WHERE team_id = $1 AND category = $2 AND id <> $3
       ORDER BY slot_number ASC`,
      [existing.team_id, input.category, teamSponsorId],
    );
    if (occupiedSlots.rows.length >= limits[input.category]) {
      return { success: false, message: 'Sponsor category is full' };
    }
    const usedSlots = new Set(occupiedSlots.rows.map((row) => Number(row.slot_number)));
    const slotNumber = Array.from({ length: limits[input.category] }, (_, index) => index + 1)
      .find((slot) => !usedSlots.has(slot));

    return transaction(async (client) => {
      const result = await client.query(
        `UPDATE team_sponsors
         SET category = $1,
             slot_number = $2,
             contract_races_remaining = $3,
             initial_reward = $4,
             reward_per_race = $5,
             updated_at = NOW()
         WHERE id = $6
         RETURNING id`,
        [
          input.category,
          slotNumber,
          input.contractRacesRemaining,
          input.initialReward,
          input.rewardPerRace,
          teamSponsorId,
        ],
      );
      if (!result.rows[0]) return { success: false, message: 'Team sponsor not found' };

      await this.recalculateTeamSponsorIncome(client, existing.team_id);
      return { success: true };
    });
  }

  async removeTeamSponsor(teamSponsorId: string) {
    return transaction(async (client) => {
      const result = await client.query(
        'DELETE FROM team_sponsors WHERE id = $1 RETURNING id, team_id',
        [teamSponsorId],
      );
      if (!result.rows[0]) return { success: false, message: 'Team sponsor not found' };

      await this.recalculateTeamSponsorIncome(client, result.rows[0].team_id);
      return { success: true };
    });
  }

  async addSponsorMission(teamSponsorId: string, type: 'race' | 'season', input: SponsorMissionInput) {
    const result = type === 'race'
      ? await query(
        `INSERT INTO team_sponsor_race_missions (team_sponsor_id, title, reward)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [teamSponsorId, input.title, input.reward],
      )
      : await query(
        `INSERT INTO team_sponsor_season_missions (team_sponsor_id, title, reward, races_to_complete)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [teamSponsorId, input.title, input.reward, input.racesToComplete],
      );
    return { success: true, mission: result.rows[0] };
  }

  async updateSponsorMission(missionId: string, type: 'race' | 'season', input: SponsorMissionInput) {
    const result = type === 'race'
      ? await query(
        `UPDATE team_sponsor_race_missions
         SET title = $1, reward = $2
         WHERE id = $3
         RETURNING id`,
        [input.title, input.reward, missionId],
      )
      : await query(
        `UPDATE team_sponsor_season_missions
         SET title = $1, reward = $2, races_to_complete = $3
         WHERE id = $4
         RETURNING id`,
        [input.title, input.reward, input.racesToComplete, missionId],
      );
    return result.rows[0]
      ? { success: true }
      : { success: false, message: 'Sponsor mission not found' };
  }

  async removeSponsorMission(missionId: string, type: 'race' | 'season') {
    const table = type === 'race'
      ? 'team_sponsor_race_missions'
      : 'team_sponsor_season_missions';
    const result = await query(`DELETE FROM ${table} WHERE id = $1 RETURNING id`, [missionId]);
    return result.rows[0]
      ? { success: true }
      : { success: false, message: 'Sponsor mission not found' };
  }

  async resolveSponsorMission(missionId: string, type: 'race' | 'season', outcome: 'success' | 'failure') {
    return transaction(async (client) => {
      const table = type === 'race'
        ? 'team_sponsor_race_missions'
        : 'team_sponsor_season_missions';
      const mission = await client.query(
        `SELECT
          m.id,
          m.title,
          m.reward,
          ts.team_id
         FROM ${table} m
         JOIN team_sponsors ts ON ts.id = m.team_sponsor_id
         WHERE m.id = $1`,
        [missionId],
      );
      const row = mission.rows[0];
      if (!row) return { success: false, message: 'Sponsor mission not found' };

      if (outcome === 'success') {
        await client.query(
          `UPDATE teams
           SET cash_total = cash_total + $1,
               updated_at = NOW()
           WHERE id = $2`,
          [row.reward, row.team_id],
        );
        await client.query(
          `INSERT INTO team_financial_history (
            team_id, amount, entry_type, reason, source
          ) VALUES ($1, $2, 'income', $3, 'sponsor')`,
          [row.team_id, row.reward, row.title],
        );
      } else {
        await client.query(
          `INSERT INTO team_financial_history (
            team_id, amount, entry_type, reason, source
          ) VALUES ($1, 0, 'expense', $2, 'sponsor')`,
          [row.team_id, `Failed mission ${row.title}`],
        );
      }

      await client.query(`DELETE FROM ${table} WHERE id = $1`, [missionId]);
      return { success: true };
    });
  }
}

export default new AdminService();
