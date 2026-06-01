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

router.get('/teams/:teamId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: translateMessage('User not authenticated', getRequestLanguage(req)),
      });
    }

    const canAccess = await garageService.userCanAccessTeam(req.user.id, req.params.teamId);
    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: translateMessage('Insufficient permissions', getRequestLanguage(req)),
      });
    }

    const garage = await garageService.getTeamGarage(req.params.teamId);
    if (!garage) {
      return res.status(404).json({
        success: false,
        message: translateMessage('Scuderia not found', getRequestLanguage(req)),
      });
    }

    return res.json({ success: true, garage });
  } catch (error) {
    console.error('Get team garage error:', error);
    return res.status(500).json({
      success: false,
      message: translateMessage('Internal server error', getRequestLanguage(req)),
    });
  }
});

router.post('/teams/:teamId/facility', authMiddleware, [
  body('facility').isIn(['climate', 'pitCrew']),
  body('action').isIn(['upgrade', 'sell']),
], async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: translateMessage('User not authenticated', getRequestLanguage(req)),
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: translateMessage('Validation failed', getRequestLanguage(req)),
        errors: translateValidationErrors(errors.array(), getRequestLanguage(req)),
      });
    }

    const canAccess = await garageService.userCanAccessTeam(req.user.id, req.params.teamId);
    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: translateMessage('Insufficient permissions', getRequestLanguage(req)),
      });
    }

    const result = await garageService.updateFacility(
      req.params.teamId,
      req.body.facility,
      req.body.action,
    );
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('Update facility error:', error);
    return res.status(500).json({
      success: false,
      message: translateMessage('Internal server error', getRequestLanguage(req)),
    });
  }
});

router.post('/teams/:teamId/driver-proposals', authMiddleware, [
  body('username')
    .isString()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),
  body('contractRaces')
    .isInt({ min: 1, max: 200 })
    .withMessage('Contract duration is invalid'),
  body('salaryPerRace')
    .isFloat({ min: 0 })
    .withMessage('Driver salary is invalid'),
  body('category')
    .isIn(['starter', 'reserve'])
    .withMessage('Driver category is invalid'),
], async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: translateMessage('User not authenticated', getRequestLanguage(req)),
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: translateMessage('Validation failed', getRequestLanguage(req)),
        errors: translateValidationErrors(errors.array(), getRequestLanguage(req)),
      });
    }

    const canAccess = await garageService.userCanAccessTeam(req.user.id, req.params.teamId);
    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: translateMessage('Insufficient permissions', getRequestLanguage(req)),
      });
    }

    const result = await garageService.createDriverProposal(
      req.params.teamId,
      req.user.id,
      req.body,
    );
    return res.status(result.success ? 201 : 400).json({
      ...result,
      message: translateMessage(result.message, getRequestLanguage(req)),
    });
  } catch (error) {
    console.error('Create driver proposal error:', error);
    return res.status(500).json({
      success: false,
      message: translateMessage('Failed to send driver proposal', getRequestLanguage(req)),
    });
  }
});

router.post('/driver-proposals/:proposalId/respond', authMiddleware, [
  body('decision')
    .isIn(['accept', 'decline'])
    .withMessage('Driver proposal response is invalid'),
], async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: translateMessage('User not authenticated', getRequestLanguage(req)),
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: translateMessage('Validation failed', getRequestLanguage(req)),
        errors: translateValidationErrors(errors.array(), getRequestLanguage(req)),
      });
    }

    const result = await garageService.respondToDriverProposal(
      req.user.id,
      req.params.proposalId,
      req.body.decision,
    );
    return res.status(result.success ? 200 : 400).json({
      ...result,
      message: translateMessage(result.message, getRequestLanguage(req)),
    });
  } catch (error) {
    console.error('Respond driver proposal error:', error);
    return res.status(500).json({
      success: false,
      message: translateMessage('Failed to update driver proposal', getRequestLanguage(req)),
    });
  }
});

router.delete('/teams/:teamId/drivers/:driverId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: translateMessage('User not authenticated', getRequestLanguage(req)),
      });
    }

    const canAccess = await garageService.userCanAccessTeam(req.user.id, req.params.teamId);
    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: translateMessage('Insufficient permissions', getRequestLanguage(req)),
      });
    }

    const result = await garageService.releaseDriver(req.params.teamId, req.params.driverId, req.user.id);
    return res.status(result.success ? 200 : 400).json({
      ...result,
      message: translateMessage(result.message, getRequestLanguage(req)),
    });
  } catch (error) {
    console.error('Release driver error:', error);
    return res.status(500).json({
      success: false,
      message: translateMessage('Failed to release driver', getRequestLanguage(req)),
    });
  }
});

router.delete('/teams/:teamId/sponsors/:teamSponsorId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: translateMessage('User not authenticated', getRequestLanguage(req)),
      });
    }

    const canAccess = await garageService.userCanAccessTeam(req.user.id, req.params.teamId);
    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: translateMessage('Insufficient permissions', getRequestLanguage(req)),
      });
    }

    const result = await garageService.releaseSponsor(req.params.teamId, req.params.teamSponsorId);
    return res.status(result.success ? 200 : 400).json({
      ...result,
      message: translateMessage(result.message, getRequestLanguage(req)),
    });
  } catch (error) {
    console.error('Release sponsor error:', error);
    return res.status(500).json({
      success: false,
      message: translateMessage('Failed to release sponsor', getRequestLanguage(req)),
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
