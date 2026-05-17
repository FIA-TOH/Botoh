import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import garageService from '../services/garageService';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { getRequestLanguage, translateMessage, translateValidationErrors } from '../i18n';

const router = Router();

// GET /garage - Get user's garage with team and upgrades
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: translateMessage('User not authenticated', getRequestLanguage(req)),
      });
    }

    const garage = await garageService.getUserGarage(req.user.id);

    if (!garage) {
      return res.status(404).json({
        success: false,
        message: translateMessage('User not found', getRequestLanguage(req)),
      });
    }

    return res.json({
      success: true,
      garage,
    });
  } catch (error) {
    console.error('Get garage error:', error);
    return res.status(500).json({
      success: false,
      message: translateMessage('Internal server error', getRequestLanguage(req)),
    });
  }
});

// GET /garage/upgrades - Get available upgrades for user
router.get('/upgrades', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: translateMessage('User not authenticated', getRequestLanguage(req)),
      });
    }

    const upgrades = await garageService.getAvailableUpgrades(req.user.id);

    return res.json({
      success: true,
      upgrades,
      count: upgrades.length,
    });
  } catch (error) {
    console.error('Get upgrades error:', error);
    return res.status(500).json({
      success: false,
      message: translateMessage('Internal server error', getRequestLanguage(req)),
    });
  }
});

// POST /garage/upgrade - Purchase upgrade
router.post('/upgrade', authMiddleware, [
  body('upgradeId')
    .isUUID()
    .withMessage('Upgrade ID must be a valid UUID'),
], async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: translateMessage('User not authenticated', getRequestLanguage(req)),
      });
    }

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: translateMessage('Validation failed', getRequestLanguage(req)),
        errors: translateValidationErrors(errors.array(), getRequestLanguage(req)),
      });
    }

    const { upgradeId } = req.body;
    const result = await garageService.purchaseUpgrade(req.user.id, upgradeId);

    if (result.success) {
      return res.json({
        success: true,
        message: translateMessage(result.message, getRequestLanguage(req)),
        garage: result.userGarage,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: translateMessage(result.message, getRequestLanguage(req)),
      });
    }
  } catch (error) {
    console.error('Purchase upgrade error:', error);
    return res.status(500).json({
      success: false,
      message: translateMessage('Internal server error', getRequestLanguage(req)),
    });
  }
});

// PUT /garage/equip/:upgradeId - Equip upgrade
router.put('/equip/:upgradeId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: translateMessage('User not authenticated', getRequestLanguage(req)),
      });
    }

    const { upgradeId } = req.params;
    const result = await garageService.equipUpgrade(req.user.id, upgradeId);

    if (result.success) {
      return res.json({
        success: true,
        message: translateMessage(result.message, getRequestLanguage(req)),
        garage: result.userGarage,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: translateMessage(result.message, getRequestLanguage(req)),
      });
    }
  } catch (error) {
    console.error('Equip upgrade error:', error);
    return res.status(500).json({
      success: false,
      message: translateMessage('Internal server error', getRequestLanguage(req)),
    });
  }
});

// DELETE /garage/upgrade/:upgradeId - Remove upgrade
router.delete('/upgrade/:upgradeId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: translateMessage('User not authenticated', getRequestLanguage(req)),
      });
    }

    const { upgradeId } = req.params;
    const result = await garageService.removeUpgrade(req.user.id, upgradeId);

    if (result.success) {
      return res.json({
        success: true,
        message: translateMessage(result.message, getRequestLanguage(req)),
        garage: result.userGarage,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: translateMessage(result.message, getRequestLanguage(req)),
      });
    }
  } catch (error) {
    console.error('Remove upgrade error:', error);
    return res.status(500).json({
      success: false,
      message: translateMessage('Internal server error', getRequestLanguage(req)),
    });
  }
});

// GET /garage/stats - Get user's upgrade statistics
router.get('/stats', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: translateMessage('User not authenticated', getRequestLanguage(req)),
      });
    }

    const stats = await garageService.getUserStats(req.user.id);

    return res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({
      success: false,
      message: translateMessage('Internal server error', getRequestLanguage(req)),
    });
  }
});

export default router;
