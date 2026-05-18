import authService from './authService';
import { query, queryOne, transaction } from '../config/database';
import garageService from './garageService';

export type TeamMembershipRole = 'team_principal' | 'team_assistant' | 'driver';

export interface TeamMembershipInput {
  teamId: string;
  roles: TeamMembershipRole[];
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
              ], NULL)
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
      await this.replaceMemberships(client, createdUser.id, input.teamMemberships);
      return createdUser;
    });

    return { success: true, user };
  }

  async updateUser(userId: string, input: AdminUserInput) {
    const usernameOwner = await authService.findUserByUsername(input.username);
    if (usernameOwner && usernameOwner.id !== userId) {
      return { success: false, message: 'Username already exists' };
    }

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
        await this.replaceMemberships(client, userId, input.teamMemberships);
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
    memberships: TeamMembershipInput[],
  ) {
    await client.query('DELETE FROM user_team_memberships WHERE user_id = $1', [userId]);

    for (const membership of memberships) {
      const primaryRole = membership.roles[0] ?? 'driver';
      await client.query(
        `INSERT INTO user_team_memberships (
          user_id,
          team_id,
          role,
          is_team_principal,
          is_team_assistant,
          is_driver
        )
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          userId,
          membership.teamId,
          primaryRole,
          membership.roles.includes('team_principal'),
          membership.roles.includes('team_assistant'),
          membership.roles.includes('driver'),
        ],
      );
    }
  }

  private hasAnyRole(memberships: TeamMembershipInput[], role: TeamMembershipRole) {
    return memberships.some((membership) => membership.roles.includes(role));
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
      `INSERT INTO teams (name, tag, color, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
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
    const existing = await queryOne(
      'SELECT id FROM team_sponsors WHERE team_id = $1 AND sponsor_id = $2',
      [scuderiaId, input.sponsorId],
    );
    if (existing) {
      return { success: false, message: 'Sponsor already assigned to scuderia' };
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
       WHERE team_id = $1 AND category = $2
       ORDER BY slot_number ASC`,
      [scuderiaId, input.category],
    );
    if (occupiedSlots.rows.length >= limits[input.category]) {
      return { success: false, message: 'Sponsor category is full' };
    }
    const usedSlots = new Set(occupiedSlots.rows.map((row) => Number(row.slot_number)));
    const slotNumber = Array.from({ length: limits[input.category] }, (_, index) => index + 1)
      .find((slot) => !usedSlots.has(slot));

    const result = await query(
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
    return { success: true, teamSponsor: result.rows[0] };
  }

  async updateTeamSponsor(teamSponsorId: string, input: Omit<TeamSponsorInput, 'sponsorId'>) {
    const existing = await queryOne(
      'SELECT team_id FROM team_sponsors WHERE id = $1',
      [teamSponsorId],
    );
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

    const result = await query(
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
    return result.rows[0]
      ? { success: true }
      : { success: false, message: 'Team sponsor not found' };
  }

  async removeTeamSponsor(teamSponsorId: string) {
    const result = await query('DELETE FROM team_sponsors WHERE id = $1 RETURNING id', [teamSponsorId]);
    return result.rows[0]
      ? { success: true }
      : { success: false, message: 'Team sponsor not found' };
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
