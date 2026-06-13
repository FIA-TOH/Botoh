import { Router, Response } from 'express';
import roomService from '../services/roomService';
import { getRequestLanguage, translateMessage } from '../i18n';

console.log('[roomRoutes] module loaded');
const router = Router();
console.log('[roomRoutes] router created');

router.use((req, res, next) => {
  console.log(`[roomRoutes] ${req.method} ${req.originalUrl}`);
  next();
});

router.get('/current-map', async (req, res: Response) => {
  const forceRefresh = req.query.refresh === '1' || req.query.refresh === 'true';
  console.log('[roomRoutes] current-map endpoint hit:', { forceRefresh });

  try {
    await roomService.refreshRoomState({
      forceBotRefresh: forceRefresh,
      reason: forceRefresh ? 'current-map endpoint refresh' : 'current-map endpoint',
    });

    const currentMap = roomService.getCurrentMap();
    console.log('[roomRoutes] current-map result:', {
      currentMap,
      forceRefresh,
    });

    if (!currentMap) {
      return res.status(404).json({
        success: false,
        message: translateMessage('No current map found', getRequestLanguage(req)),
        mapName: null,
        timestamp: new Date().toISOString(),
      });
    }

    return res.json({
      success: true,
      mapName: currentMap,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[roomRoutes] get current map error:', error);
    return res.status(500).json({
      success: false,
      message: translateMessage('Internal server error', getRequestLanguage(req)),
      mapName: null,
    });
  }
});

router.get('/game-state', async (req, res: Response) => {
  try {
    await roomService.refreshRoomState();
    const { gameState, isSynced } = roomService.getGameStateSnapshot();

    res.set('Cache-Control', 'no-store');
    return res.json({
      success: true,
      gameState,
      isSynced,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[roomRoutes] get current game state error:', error);
    return res.status(500).json({
      success: false,
      message: translateMessage('Internal server error', getRequestLanguage(req)),
      gameState: null,
      isSynced: false,
    });
  }
});

router.get('/state', async (req, res: Response) => {
  try {
    await roomService.refreshRoomState();
    const roomState = roomService.getRoomState();

    if (!roomState) {
      return res.status(404).json({
        success: false,
        message: translateMessage('Room state not available', getRequestLanguage(req)),
      });
    }

    return res.json({
      success: true,
      roomState,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[roomRoutes] get room state error:', error);
    return res.status(500).json({
      success: false,
      message: translateMessage('Internal server error', getRequestLanguage(req)),
    });
  }
});

router.get('/stats', async (req, res: Response) => {
  try {
    await roomService.refreshRoomState();
    const stats = roomService.getRoomStats();
    const isActive = roomService.isRoomActive();

    return res.json({
      success: true,
      stats,
      isActive,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[roomRoutes] get room stats error:', error);
    return res.status(500).json({
      success: false,
      message: translateMessage('Internal server error', getRequestLanguage(req)),
    });
  }
});

router.post('/map', async (req, res: Response) => {
  try {
    const { mapName } = req.body;

    if (!mapName || typeof mapName !== 'string') {
      return res.status(400).json({
        success: false,
        message: translateMessage('Map name is required', getRequestLanguage(req)),
      });
    }

    console.log('[roomRoutes] map set through HTTP:', { mapName });
    roomService.updateRoomState({
      currentMap: mapName,
    });

    return res.json({
      success: true,
      message: translateMessage('Map updated successfully', getRequestLanguage(req)),
      mapName,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[roomRoutes] set map error:', error);
    return res.status(500).json({
      success: false,
      message: translateMessage('Internal server error', getRequestLanguage(req)),
    });
  }
});

export default router;
