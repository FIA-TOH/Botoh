import { Router, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import adminService from '../services/adminService';
import { authMiddleware, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

const rolesValidation = body('roles')
  .custom((roles) => {
    if (!roles || typeof roles !== 'object') return false;
    return Boolean(roles.teamPrincipal || roles.teamAssistant || roles.driver);
  })
  .withMessage('At least one user function must be selected');

const userValidation = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('shortUsername')
    .isLength({ min: 1, max: 3 })
    .withMessage('Short username must be between 1 and 3 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Short username can only contain uppercase letters and numbers'),
  rolesValidation,
  body('teamId').isUUID().withMessage('Team is required'),
  body('driverNumber')
    .isInt({ min: 0, max: 999 })
    .withMessage('Driver number must be between 0 and 999'),
];

const createUserValidation = [
  ...userValidation,
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

const updateUserValidation = [
  ...userValidation,
  body('password')
    .optional({ values: 'falsy' })
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

const scuderiaValidation = [
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Scuderia name must be between 2 and 100 characters'),
  body('tag')
    .isLength({ min: 3, max: 3 })
    .withMessage('Scuderia abbreviation must be exactly 3 characters')
    .matches(/^[A-Z0-9]{3}$/)
    .withMessage('Scuderia abbreviation can only contain uppercase letters and numbers'),
  body('color')
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Scuderia color must be a valid hex color'),
];

function handleValidation(req: AuthRequest, res: Response) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return false;

  res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors: errors.array(),
  });
  return true;
}

router.use(authMiddleware, requireAdmin);

router.get('/users', async (_req: AuthRequest, res: Response) => {
  try {
    const users = await adminService.listUsers();
    return res.json({ success: true, users });
  } catch (error) {
    console.error('Admin list users error:', error);
    return res.status(500).json({ success: false, message: 'Failed to list users' });
  }
});

router.post('/users', createUserValidation, async (req: AuthRequest, res: Response) => {
  try {
    if (handleValidation(req, res)) return;

    const result = await adminService.createUser(req.body);
    return res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    console.error('Admin create user error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create user' });
  }
});

router.put(
  '/users/:id',
  param('id').isUUID().withMessage('Invalid user id'),
  updateUserValidation,
  async (req: AuthRequest, res: Response) => {
    try {
      if (handleValidation(req, res)) return;

      const result = await adminService.updateUser(req.params.id, req.body);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      console.error('Admin update user error:', error);
      return res.status(500).json({ success: false, message: 'Failed to update user' });
    }
  },
);

router.delete(
  '/users/:id',
  param('id').isUUID().withMessage('Invalid user id'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (handleValidation(req, res)) return;

      if (req.user?.id === req.params.id) {
        return res.status(400).json({ success: false, message: 'You cannot delete your own user' });
      }

      const result = await adminService.deleteUser(req.params.id);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      console.error('Admin delete user error:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
  },
);

router.get('/scuderias', async (_req: AuthRequest, res: Response) => {
  try {
    const scuderias = await adminService.listScuderias();
    return res.json({ success: true, scuderias });
  } catch (error) {
    console.error('Admin list scuderias error:', error);
    return res.status(500).json({ success: false, message: 'Failed to list scuderias' });
  }
});

router.post('/scuderias', scuderiaValidation, async (req: AuthRequest, res: Response) => {
  try {
    if (handleValidation(req, res)) return;

    const result = await adminService.createScuderia(req.body);
    return res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    console.error('Admin create scuderia error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create scuderia' });
  }
});

router.put(
  '/scuderias/:id',
  param('id').isUUID().withMessage('Invalid scuderia id'),
  scuderiaValidation,
  async (req: AuthRequest, res: Response) => {
    try {
      if (handleValidation(req, res)) return;

      const result = await adminService.updateScuderia(req.params.id, req.body);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      console.error('Admin update scuderia error:', error);
      return res.status(500).json({ success: false, message: 'Failed to update scuderia' });
    }
  },
);

router.delete(
  '/scuderias/:id',
  param('id').isUUID().withMessage('Invalid scuderia id'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (handleValidation(req, res)) return;

      const result = await adminService.deleteScuderia(req.params.id);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      console.error('Admin delete scuderia error:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete scuderia' });
    }
  },
);

export default router;
