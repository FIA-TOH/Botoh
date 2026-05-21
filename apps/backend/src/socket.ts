import { Server as SocketIOServer } from 'socket.io';
import { BotService } from './services/botService';
import roomService from './services/roomService';
import authService from './services/authService';
import notificationService from './services/notificationService';

export function setupSocketHandlers(io: SocketIOServer) {
  const botService = new BotService(io);
  notificationService.setSocketServer(io);

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('notifications:join', async (data: { token?: string }) => {
      const token = data?.token;
      if (!token) return;

      const payload = authService.verifyToken(token);
      if (!payload?.userId) return;

      await socket.join(notificationService.getUserRoom(payload.userId));
      notificationService.emitUnreadCount(payload.userId).catch((error) => {
        console.error('Failed to emit unread notification count:', error);
      });
    });
    
    socket.on('chat:send', (data) => {
      botService.sendToBot('chat:send', data);
    });

    socket.on('pit:call', (data) => {
      botService.sendToBot('pit:call', data);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });

    // Handle broadcast events from bot
    socket.on('broadcast:toFrontend', (data) => {
      io.emit(data.event, data.data);
    });

    socket.on('room:mapChanged', (data: { mapName?: string; timestamp?: number }) => {
      if (!data?.mapName) return;

      roomService.updateRoomState({
        currentMap: data.mapName
      });

      io.emit('room:mapChanged', {
        mapName: data.mapName,
        timestamp: data.timestamp || Date.now()
      });
    });

    socket.on('room:gameStateChanged', (data: { gameState?: 'running' | 'paused' | null; timestamp?: number }) => {
      if (data?.gameState !== 'running' && data?.gameState !== 'paused' && data?.gameState !== null) {
        return;
      }

      roomService.updateRoomState({
        gameState: data.gameState
      });

      io.emit('room:gameStateChanged', {
        gameState: data.gameState,
        timestamp: data.timestamp || Date.now()
      });
    });
  });

  return { botService };
}
