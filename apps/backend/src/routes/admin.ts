import { Router, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import adminService from '../services/adminService';
import { authMiddleware, requireAdmin, AuthRequest } from '../middleware/auth';
import { getRequestLanguage, translateMessage, translateValidationErrors } from '../i18n';
import { SPONSOR_SECTORS, SPONSOR_TARGET_AUDIENCES } from '../config/sponsorEconomy';
import { SPONSOR_CONTRACT_CATEGORIES } from '../config/sponsorMarket';

const router = Router();

const userValidation = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[\p{L}\p{N}_]+(?: [\p{L}\p{N}_]+)*$/u)
    .withMessage('Username can only contain letters, numbers, underscores, and internal spaces'),
  body('shortUsername')
    .isLength({ min: 1, max: 3 })
    .withMessage('Short username must be between 1 and 3 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Short username can only contain uppercase letters and numbers'),
  body('teamMemberships')
    .isArray()
    .withMessage('Team memberships must be an array'),
  body('teamMemberships.*.teamId')
    .isUUID()
    .withMessage('Team must be a valid UUID when provided'),
  body('teamMemberships.*.roles')
    .isArray({ min: 1 })
    .withMessage('At least one user function must be selected'),
  body('teamMemberships.*.roles.*')
    .isIn(['team_principal', 'team_assistant', 'driver'])
    .withMessage('Team membership role is invalid'),
  body('teamMemberships.*.driverCategory')
    .optional({ nullable: true })
    .isIn(['starter', 'reserve'])
    .withMessage('Driver category is invalid'),
  body('teamMemberships.*.contractRaces')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 200 })
    .withMessage('Contract duration is invalid'),
  body('teamMemberships.*.salaryPerRace')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Driver salary is invalid'),
  body('teamMemberships')
    .custom((memberships) => {
      if (!Array.isArray(memberships)) return false;
      const teamIds = memberships.map((membership) => membership.teamId);
      return new Set(teamIds).size === teamIds.length;
    })
    .withMessage('A user cannot have duplicate scuderias'),
  body('driverNumber')
    .isInt({ min: 0, max: 999 })
    .withMessage('Driver number must be between 0 and 999'),
  body('language')
    .isIn(['pt', 'en', 'es'])
    .withMessage('Language must be pt, en, or es'),
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
  body('emoji')
    .optional({ nullable: true })
    .isString()
    .custom((value) => Array.from(String(value).trim()).length <= 2)
    .withMessage('Scuderia emoji must have at most 2 characters'),
  body('color')
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Scuderia color must be a valid hex color'),
  body('logoUrl')
    .optional({ nullable: true })
    .isURL()
    .withMessage('Scuderia logo URL is invalid'),
  body('momentoComercial')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Commercial momentum must be between 0 and 100'),
  body('prestigio')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Prestige must be between 1 and 5'),
  body('agressividade')
    .optional()
    .isInt({ min: 0, max: 3 })
    .withMessage('Aggressiveness must be between 0 and 3'),
  body('popularidade')
    .optional()
    .isInt({ min: 0, max: 3 })
    .withMessage('Popularity must be between 0 and 3'),
  body('tecnica')
    .optional()
    .isInt({ min: 0, max: 3 })
    .withMessage('Technique must be between 0 and 3'),
  body('nacionalidades')
    .optional({ nullable: true })
    .isArray()
    .withMessage('Nationalities must be an array'),
  body('nacionalidades.*')
    .optional()
    .isString()
    .isLength({ min: 1, max: 120 })
    .withMessage('Nationality is invalid'),
  body('setores')
    .optional({ nullable: true })
    .isArray()
    .withMessage('Sectors must be an array'),
  body('setores.*')
    .optional()
    .isIn(SPONSOR_SECTORS)
    .withMessage('Sponsor sector is invalid'),
];

const financeEntryValidation = [
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('Finance amount must be greater than zero'),
  body('entryType')
    .isIn(['income', 'expense'])
    .withMessage('Finance entry type is invalid'),
  body('reason')
    .isLength({ min: 2, max: 255 })
    .withMessage('Finance reason must be between 2 and 255 characters'),
  body('occurredAt')
    .optional()
    .isISO8601()
    .withMessage('Finance date must be a valid ISO date'),
];
const carNameValidation = [body('carName').optional({ nullable: true }).isString().isLength({ max: 100 })];
const teamSponsorValidation = [
  body('sponsorId').isUUID(),
  body('category').isIn(['title_sponsor', 'main_partner', 'official_partner', 'minor_sponsor', 'personal_sponsor']),
  body('contractRacesRemaining').isInt({ min: 0 }),
  body('initialReward').isFloat({ min: 0 }),
  body('rewardPerRace').isFloat({ min: 0 }),
];
const updateTeamSponsorValidation = [
  body('category').isIn(['title_sponsor', 'main_partner', 'official_partner', 'minor_sponsor', 'personal_sponsor']),
  body('contractRacesRemaining').isInt({ min: 0 }),
  body('initialReward').isFloat({ min: 0 }),
  body('rewardPerRace').isFloat({ min: 0 }),
];
const sponsorValidation = [
  body()
    .custom((_value, { req }) => {
      const name = req.body.nome ?? req.body.name;
      return typeof name === 'string' && name.length >= 1 && name.length <= 120;
    })
    .withMessage('Sponsor name must be between 1 and 120 characters'),
  body('logoUrl')
    .isURL()
    .matches(/\.png(?:\?.*)?$/i)
    .withMessage('Sponsor logo URL must point to a PNG image'),
  body('nacionalidade')
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 120 })
    .withMessage('Nationality is invalid'),
  body('tipo')
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 120 })
    .withMessage('Sponsor type is invalid'),
  body('setor')
    .optional({ nullable: true })
    .isIn(SPONSOR_SECTORS)
    .withMessage('Sponsor sector is invalid'),
  body('felicidade')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Sponsor happiness must be between 0 and 100'),
  body('prestigio')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Prestige must be between 1 and 5'),
  body('agressividade')
    .optional()
    .isInt({ min: 0, max: 3 })
    .withMessage('Aggressiveness must be between 0 and 3'),
  body('focoEmMidia')
    .optional()
    .isInt({ min: 0, max: 3 })
    .withMessage('Media focus must be between 0 and 3'),
  body('focoTecnico')
    .optional()
    .isInt({ min: 0, max: 3 })
    .withMessage('Technical focus must be between 0 and 3'),
  body('nacionalismo')
    .optional()
    .isInt({ min: 0, max: 3 })
    .withMessage('Nationalism must be between 0 and 3'),
  body('fidelidade')
    .optional()
    .isInt({ min: 0, max: 3 })
    .withMessage('Loyalty must be between 0 and 3'),
  body('orcamento')
    .optional()
    .isInt({ min: 0, max: 3 })
    .withMessage('Budget must be between 0 and 3'),
  body('ambicao')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Ambition must be between 1 and 5'),
  body('publicoAlvo1')
    .optional({ nullable: true })
    .isIn(SPONSOR_TARGET_AUDIENCES)
    .withMessage('Target audience is invalid'),
  body('publicoAlvo2')
    .optional({ nullable: true })
    .isIn(SPONSOR_TARGET_AUDIENCES)
    .withMessage('Target audience is invalid'),
];
const missionValidation = [
  body('title').isString().isLength({ min: 1, max: 255 }),
  body('reward').isFloat({ min: 0 }),
  body('racesToComplete').optional().isInt({ min: 1 }),
];
const adminDriverValidation = [
  body('username')
    .isString()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),
  body('category')
    .isIn(['starter', 'reserve'])
    .withMessage('Driver category is invalid'),
  body('contractRaces')
    .isInt({ min: 1, max: 200 })
    .withMessage('Contract duration is invalid'),
  body('salaryPerRace')
    .isFloat({ min: 0 })
    .withMessage('Driver salary is invalid'),
];
const updateAdminDriverValidation = [
  body('category')
    .isIn(['starter', 'reserve'])
    .withMessage('Driver category is invalid'),
  body('contractRaces')
    .isInt({ min: 1, max: 200 })
    .withMessage('Contract duration is invalid'),
  body('salaryPerRace')
    .isFloat({ min: 0 })
    .withMessage('Driver salary is invalid'),
];
const raceProgressValidation = [
  body('direction')
    .isIn(['advance', 'rollback'])
    .withMessage('Race progress direction is invalid'),
];

function handleValidation(req: AuthRequest, res: Response) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return false;

  res.status(400).json({
    success: false,
    message: translateMessage('Validation failed', getRequestLanguage(req)),
    errors: translateValidationErrors(errors.array(), getRequestLanguage(req)),
  });
  return true;
}

router.use(authMiddleware, requireAdmin);

router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const users = await adminService.listUsers();
    return res.json({ success: true, users });
  } catch (error) {
    console.error('Admin list users error:', error);
    return res.status(500).json({ success: false, message: translateMessage('Failed to list users', getRequestLanguage(req)) });
  }
});

router.post('/users', createUserValidation, async (req: AuthRequest, res: Response) => {
  try {
    if (handleValidation(req, res)) return;

    const result = await adminService.createUser(req.body);
    return res.status(result.success ? 201 : 400).json({
      ...result,
      message: translateMessage(result.message, getRequestLanguage(req)),
    });
  } catch (error) {
    console.error('Admin create user error:', error);
    return res.status(500).json({ success: false, message: translateMessage('Failed to create user', getRequestLanguage(req)) });
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
      return res.status(result.success ? 200 : 404).json({
        ...result,
        message: translateMessage((result as { message?: string }).message, getRequestLanguage(req)),
      });
    } catch (error) {
      console.error('Admin update user error:', error);
      return res.status(500).json({ success: false, message: translateMessage('Failed to update user', getRequestLanguage(req)) });
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
        return res.status(400).json({ success: false, message: translateMessage('You cannot delete your own user', getRequestLanguage(req)) });
      }

      const result = await adminService.deleteUser(req.params.id);
      return res.status(result.success ? 200 : 404).json({
        ...result,
        message: translateMessage(result.message, getRequestLanguage(req)),
      });
    } catch (error) {
      console.error('Admin delete user error:', error);
      return res.status(500).json({ success: false, message: translateMessage('Failed to delete user', getRequestLanguage(req)) });
    }
  },
);

router.post(
  '/scuderias/:id/finance-entries',
  param('id').isUUID().withMessage('Invalid scuderia id'),
  financeEntryValidation,
  async (req: AuthRequest, res: Response) => {
    try {
      if (handleValidation(req, res)) return;

      const result = await adminService.addTeamFinanceEntry(req.params.id, req.body);
      return res.status(result.success ? 201 : 404).json({
        ...result,
        message: translateMessage(
          result.success ? 'Finance entry created successfully' : result.message,
          getRequestLanguage(req),
        ),
      });
    } catch (error) {
      console.error('Admin create finance entry error:', error);
      return res.status(500).json({
        success: false,
        message: translateMessage('Failed to create finance entry', getRequestLanguage(req)),
      });
    }
  },
);

router.get('/scuderias/:id/manage', param('id').isUUID(), async (req: AuthRequest, res: Response) => {
  const garage = await adminService.getScuderiaManagement(req.params.id);
  return garage
    ? res.json({ success: true, garage })
    : res.status(404).json({ success: false, message: translateMessage('Scuderia not found', getRequestLanguage(req)) });
});

router.get('/race-progress/alerts', async (_req: AuthRequest, res: Response) => {
  const alerts = await adminService.listRaceProgressAlerts();
  return res.json({ success: true, alerts });
});

router.delete('/race-progress/alerts', async (_req: AuthRequest, res: Response) => {
  const result = await adminService.clearRaceProgressAlerts();
  return res.json(result);
});

router.post('/race-progress', raceProgressValidation, async (req: AuthRequest, res: Response) => {
  if (handleValidation(req, res)) return;
  const result = await adminService.progressRace(req.body.direction);
  return res.status(result.success ? 200 : 400).json({
    ...result,
    message: translateMessage((result as { message?: string }).message, getRequestLanguage(req)),
  });
});

router.put('/scuderias/:id/car-name', param('id').isUUID(), carNameValidation, async (req: AuthRequest, res: Response) => {
  if (handleValidation(req, res)) return;
  const result = await adminService.updateScuderiaCarName(req.params.id, req.body.carName ?? null);
  return res.status(result.success ? 200 : 404).json(result);
});

router.post('/scuderias/:id/drivers', param('id').isUUID(), adminDriverValidation, async (req: AuthRequest, res: Response) => {
  if (handleValidation(req, res)) return;
  const result = await adminService.addScuderiaDriver(req.params.id, req.body);
  return res.status(result.success ? 201 : 400).json({
    ...result,
    message: translateMessage((result as { message?: string }).message, getRequestLanguage(req)),
  });
});

router.put('/scuderias/:id/drivers/:driverId', param('id').isUUID(), param('driverId').isUUID(), updateAdminDriverValidation, async (req: AuthRequest, res: Response) => {
  if (handleValidation(req, res)) return;
  const result = await adminService.updateScuderiaDriver(req.params.id, req.params.driverId, req.body);
  return res.status(result.success ? 200 : 400).json({
    ...result,
    message: translateMessage((result as { message?: string }).message, getRequestLanguage(req)),
  });
});

router.delete('/scuderias/:id/drivers/:driverId', param('id').isUUID(), param('driverId').isUUID(), async (req: AuthRequest, res: Response) => {
  if (handleValidation(req, res)) return;
  const result = await adminService.removeScuderiaDriver(req.params.id, req.params.driverId);
  return res.status(result.success ? 200 : 400).json({
    ...result,
    message: translateMessage((result as { message?: string }).message, getRequestLanguage(req)),
  });
});

router.get('/sponsors', async (_req: AuthRequest, res: Response) => {
  const sponsors = await adminService.listSponsors();
  return res.json({ success: true, sponsors });
});

router.post('/sponsors', sponsorValidation, async (req: AuthRequest, res: Response) => {
  if (handleValidation(req, res)) return;
  const result = await adminService.createSponsor(req.body);
  return res.status(201).json(result);
});

router.put('/sponsors/:id', param('id').isUUID(), sponsorValidation, async (req: AuthRequest, res: Response) => {
  if (handleValidation(req, res)) return;
  const result = await adminService.updateSponsor(req.params.id, req.body);
  return res.status(result.success ? 200 : 404).json({
    ...result,
    message: translateMessage((result as { message?: string }).message, getRequestLanguage(req)),
  });
});

router.delete('/sponsors/:id', param('id').isUUID(), async (req: AuthRequest, res: Response) => {
  const result = await adminService.deleteSponsor(req.params.id);
  return res.status(result.success ? 200 : 404).json({
    ...result,
    message: translateMessage((result as { message?: string }).message, getRequestLanguage(req)),
  });
});

router.post('/scuderias/:id/sponsor-market', param('id').isUUID(), async (req: AuthRequest, res: Response) => {
  if (handleValidation(req, res)) return;
  const result = await adminService.generateSponsorMarketRound(req.params.id);
  return res.status(result.success ? 200 : 400).json({
    ...result,
    message: translateMessage((result as { message?: string }).message, getRequestLanguage(req)),
  });
});

router.post('/scuderias/:id/sponsors', param('id').isUUID(), teamSponsorValidation, async (req: AuthRequest, res: Response) => {
  if (handleValidation(req, res)) return;
  const result = await adminService.addTeamSponsor(req.params.id, req.body);
  return res.status(result.success ? 201 : 400).json(result);
});

router.put('/team-sponsors/:id', param('id').isUUID(), updateTeamSponsorValidation, async (req: AuthRequest, res: Response) => {
  if (handleValidation(req, res)) return;
  const result = await adminService.updateTeamSponsor(req.params.id, req.body);
  return res.status(result.success ? 200 : 404).json(result);
});

router.delete('/team-sponsors/:id', param('id').isUUID(), async (req: AuthRequest, res: Response) => {
  const result = await adminService.removeTeamSponsor(req.params.id);
  return res.status(result.success ? 200 : 404).json(result);
});

router.post('/team-sponsors/:id/:type-missions', param('id').isUUID(), param('type').isIn(['race', 'season']), missionValidation, async (req: AuthRequest, res: Response) => {
  if (handleValidation(req, res)) return;
  const result = await adminService.addSponsorMission(req.params.id, req.params.type as 'race' | 'season', req.body);
  return res.status(201).json(result);
});

router.put('/sponsor-missions/:type/:id', param('id').isUUID(), param('type').isIn(['race', 'season']), missionValidation, async (req: AuthRequest, res: Response) => {
  if (handleValidation(req, res)) return;
  const result = await adminService.updateSponsorMission(req.params.id, req.params.type as 'race' | 'season', req.body);
  return res.status(result.success ? 200 : 404).json(result);
});

router.delete('/sponsor-missions/:type/:id', param('id').isUUID(), param('type').isIn(['race', 'season']), async (req: AuthRequest, res: Response) => {
  const result = await adminService.removeSponsorMission(req.params.id, req.params.type as 'race' | 'season');
  return res.status(result.success ? 200 : 404).json(result);
});

router.post(
  '/sponsor-missions/:type/:id/resolve',
  param('id').isUUID(),
  param('type').isIn(['race', 'season']),
  body('outcome').isIn(['success', 'failure']),
  async (req: AuthRequest, res: Response) => {
    if (handleValidation(req, res)) return;
    const result = await adminService.resolveSponsorMission(
      req.params.id,
      req.params.type as 'race' | 'season',
      req.body.outcome,
    );
    return res.status(result.success ? 200 : 404).json(result);
  },
);

router.get('/scuderias', async (req: AuthRequest, res: Response) => {
  try {
    const scuderias = await adminService.listScuderias();
    return res.json({ success: true, scuderias });
  } catch (error) {
    console.error('Admin list scuderias error:', error);
    return res.status(500).json({ success: false, message: translateMessage('Failed to list scuderias', getRequestLanguage(req)) });
  }
});

router.post('/scuderias', scuderiaValidation, async (req: AuthRequest, res: Response) => {
  try {
    if (handleValidation(req, res)) return;

    const result = await adminService.createScuderia(req.body);
    return res.status(result.success ? 201 : 400).json({
      ...result,
      message: translateMessage(result.message, getRequestLanguage(req)),
    });
  } catch (error) {
    console.error('Admin create scuderia error:', error);
    return res.status(500).json({ success: false, message: translateMessage('Failed to create scuderia', getRequestLanguage(req)) });
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
      return res.status(result.success ? 200 : 404).json({
        ...result,
        message: translateMessage(result.message, getRequestLanguage(req)),
      });
    } catch (error) {
      console.error('Admin update scuderia error:', error);
      return res.status(500).json({ success: false, message: translateMessage('Failed to update scuderia', getRequestLanguage(req)) });
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
      return res.status(result.success ? 200 : 404).json({
        ...result,
        message: translateMessage(result.message, getRequestLanguage(req)),
      });
    } catch (error) {
      console.error('Admin delete scuderia error:', error);
      return res.status(500).json({ success: false, message: translateMessage('Failed to delete scuderia', getRequestLanguage(req)) });
    }
  },
);

export default router;


