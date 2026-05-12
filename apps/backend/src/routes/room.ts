import { Router, Response } from 'express';
import roomService from '../services/roomService';

console.log('🗺️ Room routes module loaded');
const router = Router();
console.log('🗺️ Room router created');

// Debug middleware for room routes
router.use((req, res, next) => {
  console.log(`🗺️ Room Route: ${req.method} ${req.originalUrl}`);
  next();
});

// GET /room/current-map - Get current map name
router.get('/current-map', async (req, res: Response) => {
  console.log('🗺️ current-map endpoint hit');
  try {
    // Forçar atualização do estado do Room
    await roomService.refreshRoomState();
    
    // Obter o mapa atual
    const currentMap = roomService.getCurrentMap();
    
    if (!currentMap) {
      return res.status(404).json({
        success: false,
        message: 'No current map found',
        mapName: null
      });
    }

    return res.json({
      success: true,
      mapName: currentMap,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get current map error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      mapName: null
    });
  }
});

// GET /room/state - Get complete room state
router.get('/state', async (req, res: Response) => {
  try {
    await roomService.refreshRoomState();
    const roomState = roomService.getRoomState();
    
    if (!roomState) {
      return res.status(404).json({
        success: false,
        message: 'Room state not available'
      });
    }

    return res.json({
      success: true,
      roomState,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get room state error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /room/stats - Get room statistics
router.get('/stats', async (req, res: Response) => {
  try {
    await roomService.refreshRoomState();
    const stats = roomService.getRoomStats();
    const isActive = roomService.isRoomActive();

    return res.json({
      success: true,
      stats,
      isActive,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get room stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /room/map - Set current map (admin only)
router.post('/map', async (req, res: Response) => {
  try {
    const { mapName } = req.body;
    
    if (!mapName || typeof mapName !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Map name is required'
      });
    }

    // Atualizar o mapa no serviço
    roomService.updateRoomState({
      currentMap: mapName
    });

    return res.json({
      success: true,
      message: 'Map updated successfully',
      mapName,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Set map error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
