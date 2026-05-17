import authService from './authService';
import { query, queryOne } from '../config/database';

export interface AdminUserInput {
  username: string;
  password?: string;
  shortUsername: string;
  roles: {
    teamPrincipal?: boolean;
    teamAssistant?: boolean;
    driver?: boolean;
  };
  teamId: string | null;
  driverNumber: number;
  language: 'pt' | 'en' | 'es';
}

export interface ScuderiaInput {
  name: string;
  tag: string;
  color: string;
}

class AdminService {
  private normalizeTeamId(teamId: string | null | undefined) {
    return teamId || null;
  }

  async listUsers() {
    const result = await query(`
      SELECT
        u.id,
        u.username,
        u.role,
        u.money,
        u.short_username AS "shortUsername",
        u.is_team_principal AS "teamPrincipal",
        u.is_team_assistant AS "teamAssistant",
        u.is_driver AS "driver",
        u.team_id AS "teamId",
        t.name AS "teamName",
        u.driver_number AS "driverNumber",
        u.language,
        u.created_at AS "createdAt"
      FROM users u
      LEFT JOIN teams t ON u.team_id = t.id
      WHERE COALESCE(u.is_active, true) = true
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
    const result = await query(
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
        Boolean(input.roles.teamPrincipal),
        Boolean(input.roles.teamAssistant),
        Boolean(input.roles.driver),
        this.normalizeTeamId(input.teamId),
        input.driverNumber,
        input.language,
      ],
    );

    return { success: true, user: result.rows[0] };
  }

  async updateUser(userId: string, input: AdminUserInput) {
    const usernameOwner = await authService.findUserByUsername(input.username);
    if (usernameOwner && usernameOwner.id !== userId) {
      return { success: false, message: 'Username already exists' };
    }

    const values: any[] = [
      input.username,
      input.shortUsername,
      Boolean(input.roles.teamPrincipal),
      Boolean(input.roles.teamAssistant),
      Boolean(input.roles.driver),
      this.normalizeTeamId(input.teamId),
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

    const result = await query(
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
}

export default new AdminService();
