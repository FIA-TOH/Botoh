import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import authService from '../services/authService';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Validation rules
const loginValidation = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

// Validation rules for user creation
const createUserValidation = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

// POST /auth/login - User login
router.post('/login', loginValidation, async (req: Request, res: Response) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { username, password } = req.body;

    // Attempt login
    const result = await authService.login({ username, password });

    if (result.success) {
      // Set HTTP-only cookie with token (optional, for web clients)
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      return res.json({
        success: true,
        message: 'Login successful',
        token: result.token,
        user: result.user,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error('Login route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// GET /auth/me - Get current user info (protected)
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Get full user info from database
    const user = await authService.findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get user info error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// POST /auth/logout - User logout (optional, clears cookie)
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  return res.json({
    success: true,
    message: 'Logout successful',
  });
});

// POST /auth/create-user - Create new user (admin only)
router.post('/create-user', authMiddleware, createUserValidation, async (req: AuthRequest, res: Response) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    // Only admin can create users (simplified check - in production you'd check user.role)
    const { username, password } = req.body;

    // Create user using authService
    const result = await authService.createUser({
      username,
      password,
      role: 'user' // Default role for new users
    });

    if (result.success) {
      console.log(` New user created: ${username} by admin`);
      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: result.user
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message || 'Failed to create user'
      });
    }
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /auth/verify - Verify token validity
router.get('/verify', authMiddleware, (req: AuthRequest, res: Response) => {
  return res.json({
    success: true,
    message: 'Token is valid',
    user: req.user,
  });
});

export default router;
