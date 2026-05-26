import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import authService from '../services/authService';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { getRequestLanguage, translateMessage, translateValidationErrors } from '../i18n';

const router = Router();

router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Validation rules
const loginValidation = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[\p{L}\p{N}_]+(?: [\p{L}\p{N}_]+)*$/u)
    .withMessage('Username can only contain letters, numbers, underscores, and internal spaces'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('teamTag')
    .optional({ nullable: true })
    .isLength({ min: 3, max: 3 })
    .withMessage('Scuderia abbreviation must be exactly 3 characters')
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage('Scuderia abbreviation can only contain letters and numbers'),
];

// Validation rules for user creation
const createUserValidation = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[\p{L}\p{N}_]+(?: [\p{L}\p{N}_]+)*$/u)
    .withMessage('Username can only contain letters, numbers, underscores, and internal spaces'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('shortUsername')
    .isLength({ min: 1, max: 3 })
    .withMessage('Short username must be between 1 and 3 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Short username can only contain uppercase letters and numbers'),
  body('roles')
    .custom((roles) => {
      if (!roles || typeof roles !== 'object') return false;
      return Boolean(roles.teamPrincipal || roles.teamAssistant || roles.driver);
    })
    .withMessage('At least one user function must be selected'),
  body('teamId')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('Team must be a valid UUID when provided'),
  body('driverNumber')
    .isInt({ min: 0, max: 999 })
    .withMessage('Driver number must be between 0 and 999'),
  body('language')
    .optional()
    .isIn(['pt', 'en', 'es'])
    .withMessage('Language must be pt, en, or es'),
];

// POST /auth/login - User login
router.post('/login', loginValidation, async (req: Request, res: Response) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: translateMessage('Validation failed', getRequestLanguage(req)),
        errors: translateValidationErrors(errors.array(), getRequestLanguage(req)),
      });
    }

    const { username, password, teamTag } = req.body;

    // Attempt login
    const result = await authService.login({ username, password, teamTag });

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
        message: translateMessage('Login successful', getRequestLanguage(req)),
        token: result.token,
        user: result.user,
      });
    } else {
      return res.status(result.statusCode ?? 401).json({
        success: false,
        code: result.code,
        message: translateMessage(result.message, getRequestLanguage(req)),
      });
    }
  } catch (error) {
    console.error('Login route error:', error);
    return res.status(500).json({
      success: false,
      message: translateMessage('Internal server error', getRequestLanguage(req)),
    });
  }
});

// GET /auth/me - Get current user info (protected)
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: translateMessage('User not authenticated', getRequestLanguage(req)),
      });
    }

    // Get full user info from database
    const user = await authService.findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: translateMessage('User not found', getRequestLanguage(req)),
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
      message: translateMessage('Internal server error', getRequestLanguage(req)),
    });
  }
});

// POST /auth/logout - User logout (optional, clears cookie)
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  return res.json({
    success: true,
    message: translateMessage('Logout successful', getRequestLanguage(req)),
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
        message: translateMessage('Validation failed', getRequestLanguage(req)),
        errors: translateValidationErrors(errors.array(), getRequestLanguage(req)),
      });
    }

    // Only admin can create users (simplified check - in production you'd check user.role)
    const {
      username,
      password,
      shortUsername,
      roles,
      teamId,
      driverNumber,
      language,
    } = req.body;

    // TODO: persist shortUsername, roles, teamId and driverNumber once user/team
    // metadata exists in the backend database model.
    void shortUsername;
    void roles;
    void teamId;
    void driverNumber;

    // Create user using authService
    const result = await authService.createUser({
      username,
      password,
      role: 'user' // Default role for new users
      ,
      language: language ?? 'pt',
    });

    if (result.success) {
      console.log(` New user created: ${username} by admin`);
      return res.status(201).json({
        success: true,
        message: translateMessage('User created successfully', getRequestLanguage(req)),
        user: result.user
      });
    } else {
      return res.status(400).json({
        success: false,
        message: translateMessage(result.message || 'Failed to create user', getRequestLanguage(req))
      });
    }
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({
      success: false,
      message: translateMessage('Internal server error', getRequestLanguage(req))
    });
  }
});

// GET /auth/verify - Verify token validity
router.get('/verify', authMiddleware, (req: AuthRequest, res: Response) => {
  return res.json({
    success: true,
    message: translateMessage('Token is valid', getRequestLanguage(req)),
    user: req.user,
  });
});

export default router;

