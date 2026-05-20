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
  teamColor: string | null;
  teamMemberships: {
    teamId: string;
    teamName: string;
    teamTag: string | null;
    teamColor: string | null;
    roles: ('team_principal' | 'team_assistant' | 'driver')[];
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
  private selectTeamForLogin(
    user: User,
    teamTag?: string | null,
  ): Pick<User, 'teamId' | 'teamName' | 'teamTag' | 'teamColor'> | null {
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
        teamColor: selectedMembership.teamColor,
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
        teamColor: fallbackMembership.teamColor,
      };
    }

    return {
      teamId: user.teamId,
      teamName: user.teamName,
      teamTag: user.teamTag,
      teamColor: user.teamColor,
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
  async findUserByUsername(username: string): Promise<User | null> {
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
          COALESCE(primary_team.color, legacy_team.color) AS "teamColor",
          COALESCE(memberships.items, '[]'::json) AS "teamMemberships",
          u.language,
          u.created_at
        FROM users u
        LEFT JOIN teams legacy_team ON u.team_id = legacy_team.id
        LEFT JOIN LATERAL (
          SELECT t.id, t.name, t.tag, t.color
          FROM user_team_memberships utm
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
              'teamColor', t.color,
              'roles', ARRAY_REMOVE(ARRAY[
                CASE WHEN utm.is_team_principal THEN 'team_principal' END,
                CASE WHEN utm.is_team_assistant THEN 'team_assistant' END,
                CASE WHEN utm.is_driver THEN 'driver' END
              ], NULL),
              'driverCategory', COALESCE(td.category, utm.driver_category)
            )
            ORDER BY t.name
          ) AS items
          FROM user_team_memberships utm
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
          COALESCE(primary_team.color, legacy_team.color) AS "teamColor",
          COALESCE(memberships.items, '[]'::json) AS "teamMemberships",
          u.language,
          u.created_at
        FROM users u
        LEFT JOIN teams legacy_team ON u.team_id = legacy_team.id
        LEFT JOIN LATERAL (
          SELECT t.id, t.name, t.tag, t.color
          FROM user_team_memberships utm
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
              'teamColor', t.color,
              'roles', ARRAY_REMOVE(ARRAY[
                CASE WHEN utm.is_team_principal THEN 'team_principal' END,
                CASE WHEN utm.is_team_assistant THEN 'team_assistant' END,
                CASE WHEN utm.is_driver THEN 'driver' END
              ], NULL),
              'driverCategory', COALESCE(td.category, utm.driver_category)
            )
            ORDER BY t.name
          ) AS items
          FROM user_team_memberships utm
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
      const user = await this.findUserByUsername(loginData.username);

      if (!user) {
        return {
          success: false,
          message: 'Invalid username or password',
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
          message: 'Invalid username or password',
        };
      }

      const selectedTeam = this.selectTeamForLogin(user, loginData.teamTag);
      if (loginData.teamTag && !selectedTeam) {
        return {
          success: false,
          message: 'User does not belong to this scuderia',
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
      return {
        success: false,
        message: 'Internal server error during login',
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
