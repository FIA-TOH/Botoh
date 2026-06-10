import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { queryOne, query } from '../config/database';
import config from '../config/environment';

export interface User {
  id: string;
  username: string;
  password_hash: string;
  role: string;
  money: number;
  shortUsername: string | null;
  driverNumber: number | null;
  teamId: string | null;
  teamName: string | null;
  teamTag: string | null;
  teamEmoji: string | null;
  teamColor: string | null;
  pitLevel: number | null;
  weatherLevel: number | null;
  driverCategory: 'starter' | 'reserve' | null;
  teamMemberships: {
    teamId: string;
    teamName: string;
    teamTag: string | null;
    teamEmoji: string | null;
    teamColor: string | null;
    teamCategory: 'formula_1' | 'formula_2';
    pitLevel: number | null;
    weatherLevel: number | null;
    roles: ('team_principal' | 'team_assistant' | 'driver' | 'engineer')[];
    driverCategory: 'starter' | 'reserve' | null;
  }[];
  language: 'pt' | 'en' | 'es';
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  teamTag?: string | null;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: Omit<User, 'password_hash'>;
  message?: string;
  code?: 'USER_NOT_FOUND' | 'INCORRECT_PASSWORD' | 'SCUDERIA_ACCESS_DENIED' | 'DATABASE_UNAVAILABLE' | 'LOGIN_FAILED';
  statusCode?: number;
}

export interface JwtPayload {
  userId: string;
  username: string;
  role: string;
  language?: 'pt' | 'en' | 'es';
  iat?: number;
  exp?: number;
}

class AuthService {
  private isDatabaseUnavailableError(error: unknown): boolean {
    const code = (error as { code?: string } | null)?.code;
    return [
      'DATABASE_UNAVAILABLE',
      'ECONNREFUSED',
      'ECONNRESET',
      'ENETUNREACH',
      'ENOTFOUND',
      'ETIMEDOUT',
      '3D000',
      '28P01',
      '57P01',
    ].includes(code ?? '');
  }

  private selectTeamForLogin(
    user: User,
    teamTag?: string | null,
  ): Pick<User, 'teamId' | 'teamName' | 'teamTag' | 'teamEmoji' | 'teamColor' | 'pitLevel' | 'weatherLevel' | 'driverCategory'> | null {
    const memberships = Array.isArray(user.teamMemberships) ? user.teamMemberships : [];
    const normalizedTeamTag = teamTag?.trim().toUpperCase();

    if (normalizedTeamTag) {
      const selectedMembership = memberships.find(
        (membership) => membership.teamTag?.toUpperCase() === normalizedTeamTag,
      );

      if (!selectedMembership) return null;

      return {
        teamId: selectedMembership.teamId,
        teamName: selectedMembership.teamName,
        teamTag: selectedMembership.teamTag,
        teamEmoji: selectedMembership.teamEmoji,
        teamColor: selectedMembership.teamColor,
        pitLevel: selectedMembership.pitLevel,
        weatherLevel: selectedMembership.weatherLevel,
        driverCategory: selectedMembership.driverCategory,
      };
    }

    const starterMembership = memberships.find(
      (membership) => membership.roles.includes('driver') && membership.driverCategory === 'starter',
    );
    const fallbackMembership = starterMembership ?? memberships[0];

    if (fallbackMembership) {
      return {
        teamId: fallbackMembership.teamId,
        teamName: fallbackMembership.teamName,
        teamTag: fallbackMembership.teamTag,
        teamEmoji: fallbackMembership.teamEmoji,
        teamColor: fallbackMembership.teamColor,
        pitLevel: fallbackMembership.pitLevel,
        weatherLevel: fallbackMembership.weatherLevel,
        driverCategory: fallbackMembership.driverCategory,
      };
    }

    return {
      teamId: user.teamId,
      teamName: user.teamName,
      teamTag: user.teamTag,
      teamEmoji: user.teamEmoji,
      teamColor: user.teamColor,
      pitLevel: user.pitLevel,
      weatherLevel: user.weatherLevel,
      driverCategory: null,
    };
  }

  // Hash password
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Compare password
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate JWT token
  generateToken(user: Omit<User, 'password_hash'>): string {
    const payload: JwtPayload = {
      userId: user.id,
      username: user.username,
      role: user.role || 'user', // Use role from database
      language: user.language || 'pt',
    };

    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: '24h',
      issuer: 'ftoh-bot',
      audience: 'ftoh-users',
    });
  }

  // Verify JWT token
  verifyToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, config.jwtSecret) as JwtPayload;
    } catch (error) {
      console.error('JWT verification failed:', error);
      return null;
    }
  }

  // Find user by username
  async findUserByUsername(username: string, throwOnError = false): Promise<User | null> {
    try {
      const user = await queryOne<User>(
        `SELECT
          u.id,
          u.username,
          u.password_hash,
          u.role,
          u.money,
          u.short_username AS "shortUsername",
          u.driver_number AS "driverNumber",
          COALESCE(primary_team.id, legacy_team.id) AS "teamId",
          COALESCE(primary_team.name, legacy_team.name) AS "teamName",
          COALESCE(primary_team.tag, legacy_team.tag) AS "teamTag",
          COALESCE(primary_team.emoji, legacy_team.emoji) AS "teamEmoji",
          COALESCE(primary_team.color, legacy_team.color) AS "teamColor",
          COALESCE(LEAST(5, GREATEST(0, COALESCE(primary_team.pit_crew_level, legacy_team.pit_crew_level))), 0) AS "pitLevel",
          COALESCE(LEAST(5, GREATEST(0, COALESCE(primary_team.climate_monitoring_level, legacy_team.climate_monitoring_level))), 0) AS "weatherLevel",
          primary_team.driver_category AS "driverCategory",
          COALESCE(memberships.items, '[]'::json) AS "teamMemberships",
          u.language,
          u.created_at
        FROM users u
        LEFT JOIN teams legacy_team ON u.team_id = legacy_team.id
        LEFT JOIN LATERAL (
          SELECT t.id, t.name, t.tag, t.emoji, t.color, COALESCE(t.category, 'formula_1') AS team_category, t.pit_crew_level, t.climate_monitoring_level, COALESCE(td.category, utm.driver_category) AS driver_category
          FROM (
            SELECT
              direct.user_id,
              direct.team_id,
              direct.is_team_principal,
              direct.is_team_assistant,
              direct.is_engineer,
              direct.is_driver,
              direct.driver_category
            FROM user_team_memberships direct
            WHERE direct.user_id = u.id
            UNION ALL
            SELECT
              parent.user_id,
              junior_team.id AS team_id,
              parent.is_team_principal,
              parent.is_team_assistant,
              parent.is_engineer,
              false AS is_driver,
              null AS driver_category
            FROM user_team_memberships parent
            JOIN teams junior_team
              ON junior_team.parent_team_id = parent.team_id
             AND junior_team.is_junior_team = true
            WHERE parent.user_id = u.id
              AND (parent.is_team_principal = true OR parent.is_team_assistant = true OR parent.is_engineer = true)
              AND NOT EXISTS (
                SELECT 1
                FROM user_team_memberships direct
                WHERE direct.user_id = parent.user_id
                  AND direct.team_id = junior_team.id
              )
          ) utm
          JOIN teams t ON t.id = utm.team_id
          LEFT JOIN team_drivers td
            ON td.user_id = utm.user_id
           AND td.team_id = utm.team_id
           AND td.status = 'active'
          WHERE utm.user_id = u.id
          ORDER BY
            CASE WHEN td.category = 'starter' THEN 0 ELSE 1 END,
            t.name
          LIMIT 1
        ) primary_team ON true
        LEFT JOIN LATERAL (
          SELECT json_agg(
            json_build_object(
              'teamId', t.id,
              'teamName', t.name,
              'teamTag', t.tag,
              'teamEmoji', t.emoji,
              'teamColor', t.color,
              'teamCategory', COALESCE(t.category, 'formula_1'),
              'pitLevel', COALESCE(LEAST(5, GREATEST(0, t.pit_crew_level)), 0),
              'weatherLevel', COALESCE(LEAST(5, GREATEST(0, t.climate_monitoring_level)), 0),
              'roles', ARRAY_REMOVE(ARRAY[
                CASE WHEN utm.is_team_principal THEN 'team_principal' END,
                CASE WHEN utm.is_team_assistant THEN 'team_assistant' END,
                CASE WHEN utm.is_engineer THEN 'engineer' END,
                CASE WHEN utm.is_driver THEN 'driver' END
              ], NULL),
              'driverCategory', COALESCE(td.category, utm.driver_category)
            )
            ORDER BY t.name
          ) AS items
          FROM (
            SELECT
              direct.user_id,
              direct.team_id,
              direct.is_team_principal,
              direct.is_team_assistant,
              direct.is_engineer,
              direct.is_driver,
              direct.driver_category
            FROM user_team_memberships direct
            WHERE direct.user_id = u.id
            UNION ALL
            SELECT
              parent.user_id,
              junior_team.id AS team_id,
              parent.is_team_principal,
              parent.is_team_assistant,
              parent.is_engineer,
              false AS is_driver,
              null AS driver_category
            FROM user_team_memberships parent
            JOIN teams junior_team
              ON junior_team.parent_team_id = parent.team_id
             AND junior_team.is_junior_team = true
            WHERE parent.user_id = u.id
              AND (parent.is_team_principal = true OR parent.is_team_assistant = true OR parent.is_engineer = true)
              AND NOT EXISTS (
                SELECT 1
                FROM user_team_memberships direct
                WHERE direct.user_id = parent.user_id
                  AND direct.team_id = junior_team.id
              )
          ) utm
          JOIN teams t ON t.id = utm.team_id
          LEFT JOIN team_drivers td
            ON td.user_id = utm.user_id
           AND td.team_id = utm.team_id
           AND td.status = 'active'
          WHERE utm.user_id = u.id
        ) memberships ON true
        WHERE LOWER(u.username) = LOWER($1)
        ORDER BY CASE WHEN u.username = $1 THEN 0 ELSE 1 END, u.created_at DESC
        LIMIT 1`,
        [username]
      );

      return user;
    } catch (error) {
      console.error('Error finding user:', error);
      if (throwOnError) {
        throw error;
      }
      return null;
    }
  }

  // Find user by ID
  async findUserById(userId: string): Promise<Omit<User, 'password_hash'> | null> {
    try {
      const user = await queryOne<User>(
        `SELECT
          u.id,
          u.username,
          u.password_hash,
          u.role,
          u.money,
          u.short_username AS "shortUsername",
          u.driver_number AS "driverNumber",
          COALESCE(primary_team.id, legacy_team.id) AS "teamId",
          COALESCE(primary_team.name, legacy_team.name) AS "teamName",
          COALESCE(primary_team.tag, legacy_team.tag) AS "teamTag",
          COALESCE(primary_team.emoji, legacy_team.emoji) AS "teamEmoji",
          COALESCE(primary_team.color, legacy_team.color) AS "teamColor",
          COALESCE(LEAST(5, GREATEST(0, COALESCE(primary_team.pit_crew_level, legacy_team.pit_crew_level))), 0) AS "pitLevel",
          COALESCE(LEAST(5, GREATEST(0, COALESCE(primary_team.climate_monitoring_level, legacy_team.climate_monitoring_level))), 0) AS "weatherLevel",
          primary_team.driver_category AS "driverCategory",
          COALESCE(memberships.items, '[]'::json) AS "teamMemberships",
          u.language,
          u.created_at
        FROM users u
        LEFT JOIN teams legacy_team ON u.team_id = legacy_team.id
        LEFT JOIN LATERAL (
          SELECT t.id, t.name, t.tag, t.emoji, t.color, COALESCE(t.category, 'formula_1') AS team_category, t.pit_crew_level, t.climate_monitoring_level, COALESCE(td.category, utm.driver_category) AS driver_category
          FROM (
            SELECT
              direct.user_id,
              direct.team_id,
              direct.is_team_principal,
              direct.is_team_assistant,
              direct.is_engineer,
              direct.is_driver,
              direct.driver_category
            FROM user_team_memberships direct
            WHERE direct.user_id = u.id
            UNION ALL
            SELECT
              parent.user_id,
              junior_team.id AS team_id,
              parent.is_team_principal,
              parent.is_team_assistant,
              parent.is_engineer,
              false AS is_driver,
              null AS driver_category
            FROM user_team_memberships parent
            JOIN teams junior_team
              ON junior_team.parent_team_id = parent.team_id
             AND junior_team.is_junior_team = true
            WHERE parent.user_id = u.id
              AND (parent.is_team_principal = true OR parent.is_team_assistant = true OR parent.is_engineer = true)
              AND NOT EXISTS (
                SELECT 1
                FROM user_team_memberships direct
                WHERE direct.user_id = parent.user_id
                  AND direct.team_id = junior_team.id
              )
          ) utm
          JOIN teams t ON t.id = utm.team_id
          LEFT JOIN team_drivers td
            ON td.user_id = utm.user_id
           AND td.team_id = utm.team_id
           AND td.status = 'active'
          WHERE utm.user_id = u.id
          ORDER BY
            CASE WHEN td.category = 'starter' THEN 0 ELSE 1 END,
            t.name
          LIMIT 1
        ) primary_team ON true
        LEFT JOIN LATERAL (
          SELECT json_agg(
            json_build_object(
              'teamId', t.id,
              'teamName', t.name,
              'teamTag', t.tag,
              'teamEmoji', t.emoji,
              'teamColor', t.color,
              'teamCategory', COALESCE(t.category, 'formula_1'),
              'pitLevel', COALESCE(LEAST(5, GREATEST(0, t.pit_crew_level)), 0),
              'weatherLevel', COALESCE(LEAST(5, GREATEST(0, t.climate_monitoring_level)), 0),
              'roles', ARRAY_REMOVE(ARRAY[
                CASE WHEN utm.is_team_principal THEN 'team_principal' END,
                CASE WHEN utm.is_team_assistant THEN 'team_assistant' END,
                CASE WHEN utm.is_engineer THEN 'engineer' END,
                CASE WHEN utm.is_driver THEN 'driver' END
              ], NULL),
              'driverCategory', COALESCE(td.category, utm.driver_category)
            )
            ORDER BY t.name
          ) AS items
          FROM (
            SELECT
              direct.user_id,
              direct.team_id,
              direct.is_team_principal,
              direct.is_team_assistant,
              direct.is_engineer,
              direct.is_driver,
              direct.driver_category
            FROM user_team_memberships direct
            WHERE direct.user_id = u.id
            UNION ALL
            SELECT
              parent.user_id,
              junior_team.id AS team_id,
              parent.is_team_principal,
              parent.is_team_assistant,
              parent.is_engineer,
              false AS is_driver,
              null AS driver_category
            FROM user_team_memberships parent
            JOIN teams junior_team
              ON junior_team.parent_team_id = parent.team_id
             AND junior_team.is_junior_team = true
            WHERE parent.user_id = u.id
              AND (parent.is_team_principal = true OR parent.is_team_assistant = true OR parent.is_engineer = true)
              AND NOT EXISTS (
                SELECT 1
                FROM user_team_memberships direct
                WHERE direct.user_id = parent.user_id
                  AND direct.team_id = junior_team.id
              )
          ) utm
          JOIN teams t ON t.id = utm.team_id
          LEFT JOIN team_drivers td
            ON td.user_id = utm.user_id
           AND td.team_id = utm.team_id
           AND td.status = 'active'
          WHERE utm.user_id = u.id
        ) memberships ON true
        WHERE u.id = $1`,
        [userId]
      );

      if (!user) return null;

      // Remove password hash before returning
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  }

  // Login user
  async login(loginData: LoginRequest): Promise<AuthResponse> {
    try {
      // Find user by username
      const user = await this.findUserByUsername(loginData.username, true);

      if (!user) {
        return {
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND',
          statusCode: 401,
        };
      }

      // Check password
      const isPasswordValid = await this.comparePassword(
        loginData.password,
        user.password_hash
      );

      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Incorrect password',
          code: 'INCORRECT_PASSWORD',
          statusCode: 401,
        };
      }

      const selectedTeam = this.selectTeamForLogin(user, loginData.teamTag);
      if (loginData.teamTag && !selectedTeam) {
        return {
          success: false,
          message: 'User does not belong to this scuderia',
          code: 'SCUDERIA_ACCESS_DENIED',
          statusCode: 403,
        };
      }

      // Remove password hash from user object
      const { password_hash, ...userWithoutPassword } = user;
      const userWithSelectedTeam = {
        ...userWithoutPassword,
        ...(selectedTeam ?? {}),
      };

      // Generate JWT token
      const token = this.generateToken(userWithSelectedTeam);

      return {
        success: true,
        token,
        user: userWithSelectedTeam,
      };
    } catch (error) {
      console.error('Login error:', error);

      if (this.isDatabaseUnavailableError(error)) {
        return {
          success: false,
          message: 'Database is temporarily unavailable. Please try again later.',
          code: 'DATABASE_UNAVAILABLE',
          statusCode: 503,
        };
      }

      return {
        success: false,
        message: 'Internal server error during login',
        code: 'LOGIN_FAILED',
        statusCode: 500,
      };
    }
  }

  // Create new user (for admin to create users)
  async createUser(userData: {
    username: string;
    password: string;
      role?: string;
      language?: 'pt' | 'en' | 'es';
  }): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await this.findUserByUsername(userData.username);
      if (existingUser) {
        return {
          success: false,
          message: 'Username already exists',
        };
      }

      // Hash password
      const passwordHash = await this.hashPassword(userData.password);

      // Insert new user
      const result = await query(
        `INSERT INTO users (username, password_hash, role, money, language, created_at) 
         VALUES ($1, $2, $3, $4, $5, NOW()) 
         RETURNING id, username, role, money, language, created_at`,
        [
          userData.username,
          passwordHash,
          userData.role || 'user', // Use provided role or default to 'user'
          50000, // Starting money
          userData.language || 'pt',
        ]
      );

      const newUser = result.rows[0];
      const token = this.generateToken(newUser);

      return {
        success: true,
        token,
        user: newUser,
      };
    } catch (error) {
      console.error('User creation error:', error);
      return {
        success: false,
        message: 'Failed to create user',
      };
    }
  }
}

export default new AuthService();
