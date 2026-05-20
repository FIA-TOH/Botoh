import { Router, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import notificationService, { NotificationType } from '../services/notificationService';
import { getRequestLanguage, translateMessage, translateValidationErrors } from '../i18n';

const router = Router();

const notificationValidation = [
  body('userId').isUUID().withMessage('Invalid user id'),
  body('title').isString().trim().isLength({ min: 1, max: 120 }).withMessage('Notification title is required'),
  body('message').isString().trim().isLength({ min: 1, max: 500 }).withMessage('Notification message is required'),
  body('type').optional().isIn(['info', 'success', 'warning', 'error']).withMessage('Notification type is invalid'),
  body('metadata').optional().isObject(),
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

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: translateMessage('User not authenticated', getRequestLanguage(req)),
      });
    }

    const notifications = await notificationService.listForUser(req.user.id);
    const unreadCount = await notificationService.getUnreadCount(req.user.id);

    return res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    console.error('List notifications error:', error);
    return res.status(500).json({
      success: false,
      message: translateMessage('Failed to list notifications', getRequestLanguage(req)),
    });
  }
});

router.post('/', notificationValidation, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: translateMessage('User not authenticated', getRequestLanguage(req)),
      });
    }

    if (handleValidation(req, res)) return;

    if (req.user.role !== 'admin' && req.body.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: translateMessage('Insufficient permissions', getRequestLanguage(req)),
      });
    }

    const notification = await notificationService.create({
      userId: req.body.userId,
      senderUserId: req.user.id,
      title: req.body.title,
      message: req.body.message,
      type: req.body.type as NotificationType | undefined,
      metadata: req.body.metadata,
    });

    return res.status(201).json({
      success: true,
      message: translateMessage('Notification sent successfully', getRequestLanguage(req)),
      notification,
    });
  } catch (error) {
    console.error('Create notification error:', error);
    return res.status(500).json({
      success: false,
      message: translateMessage('Failed to send notification', getRequestLanguage(req)),
    });
  }
});

router.put('/:id/read', param('id').isUUID().withMessage('Invalid notification id'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: translateMessage('User not authenticated', getRequestLanguage(req)),
      });
    }

    if (handleValidation(req, res)) return;

    const notification = await notificationService.markAsRead(req.user.id, req.params.id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: translateMessage('Notification not found', getRequestLanguage(req)),
      });
    }

    return res.json({ success: true, notification });
  } catch (error) {
    console.error('Mark notification read error:', error);
    return res.status(500).json({
      success: false,
      message: translateMessage('Failed to update notification', getRequestLanguage(req)),
    });
  }
});

router.put('/read-all', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: translateMessage('User not authenticated', getRequestLanguage(req)),
      });
    }

    await notificationService.markAllAsRead(req.user.id);
    return res.json({
      success: true,
      message: translateMessage('Notifications marked as read', getRequestLanguage(req)),
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    return res.status(500).json({
      success: false,
      message: translateMessage('Failed to update notification', getRequestLanguage(req)),
    });
  }
});

export default router;
