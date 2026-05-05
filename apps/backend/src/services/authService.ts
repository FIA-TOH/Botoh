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
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
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
  iat?: number;
  exp?: number;
}

class AuthService {
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
          id, 
          username, 
          password_hash, 
          money, 
          created_at
        FROM users 
        WHERE username = $1`,
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
          id, 
          username, 
          password_hash, 
          role,
          money, 
          created_at
        FROM users 
        WHERE id = $1`,
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

      // Remove password hash from user object
      const { password_hash, ...userWithoutPassword } = user;

      // Generate JWT token
      const token = this.generateToken(userWithoutPassword);

      return {
        success: true,
        token,
        user: userWithoutPassword,
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
        `INSERT INTO users (username, password_hash, role, money, created_at) 
         VALUES ($1, $2, $3, $4, NOW()) 
         RETURNING id, username, role, money, created_at`,
        [
          userData.username,
          passwordHash,
          userData.role || 'user', // Use provided role or default to 'user'
          50000, // Starting money
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
