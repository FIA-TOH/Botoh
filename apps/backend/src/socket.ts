import { Server as SocketIOServer } from 'socket.io';
import { BotService } from './services/botService';
import roomService from './services/roomService';
import authService from './services/authService';
import notificationService from './services/notificationService';

export function setupSocketHandlers(io: SocketIOServer) {
  const botService = new BotService(io);
  notificationService.setSocketServer(io);

  function isAuthorizedBot(data?: { token?: string }, socket?: any) {
    const expectedToken = process.env.BOT_SOCKET_TOKEN;

    if (!expectedToken) {
      return true;
    }

    return data?.token === expectedToken || socket?.handshake?.auth?.botToken === expectedToken;
  }

  function isCurrentBot(socket: any) {
    return isAuthorizedBot(undefined, socket) && botService.isCurrentBotSocket(socket);
  }

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
    
    socket.on('chat:send', (data, callback) => {
      botService.sendToBot('chat:send', data, callback);
    });

    socket.on('pit:call', (data, callback) => {
      botService.sendToBot('pit:call', data, callback);
    });

    socket.on('pit:prepare-tyre', (data, callback) => {
      botService.sendToBot('pit:prepare-tyre', data, callback);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });

    // Handle broadcast events from bot
    socket.on('broadcast:toFrontend', (data) => {
      if (!isCurrentBot(socket)) return;

      io.emit(data.event, data.data);
    });

    socket.on('room:mapChanged', (data: { mapName?: string; timestamp?: number }) => {
      if (!isCurrentBot(socket)) return;
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
      if (!isCurrentBot(socket)) return;
      if (data?.gameState !== 'running' && data?.gameState !== 'paused' && data?.gameState !== null) {
        return;
      }

      roomService.updateGameState(data.gameState);

      io.emit('room:gameStateChanged', {
        gameState: data.gameState,
        timestamp: data.timestamp || Date.now()
      });
    });

    socket.on('room:opened', (data: {
      roomName?: string;
      roomLink?: string;
      leagueMode?: boolean;
      envName?: string;
      maxPlayers?: number;
      public?: boolean;
      timestamp?: number;
    }) => {
      if (!isCurrentBot(socket)) return;

      const openedState: Parameters<typeof roomService.markRoomOpened>[0] = {
        startTime: new Date(data?.timestamp || Date.now()),
        openedAt: new Date(data?.timestamp || Date.now()),
      };

      if (data?.roomName !== undefined) openedState.roomName = data.roomName;
      if (data?.roomLink !== undefined) openedState.roomLink = data.roomLink;
      if (data?.leagueMode !== undefined) openedState.leagueMode = data.leagueMode;
      if (data?.envName !== undefined) openedState.envName = data.envName;
      if (data?.maxPlayers !== undefined) openedState.maxPlayers = data.maxPlayers;
      if (data?.public !== undefined) openedState.public = data.public;

      roomService.markRoomOpened(openedState);

      io.emit('room:opened', {
        ...data,
        timestamp: data?.timestamp || Date.now(),
      });
    });

    socket.on('room:heartbeat', (data: {
      playerCount?: number;
      currentMap?: string | null;
      gameState?: 'running' | 'paused' | null;
      timestamp?: number;
    }) => {
      if (!isCurrentBot(socket)) return;

      const heartbeatState: Parameters<typeof roomService.markRoomHeartbeat>[0] = {};
      if (Number.isFinite(data?.playerCount)) {
        heartbeatState.playerCount = data.playerCount;
      }
      if (typeof data?.currentMap === 'string' && data.currentMap.length > 0) {
        heartbeatState.currentMap = data.currentMap;
      }
      // Heartbeats only include `gameState` once the bot has captured a real
      // room state event; `null` then means the game actually stopped.
      if (data?.gameState === 'running' || data?.gameState === 'paused' || data?.gameState === null) {
        heartbeatState.gameState = data.gameState;
      }

      roomService.markRoomHeartbeat(heartbeatState);

      io.emit('room:heartbeat', {
        playerCount: data?.playerCount,
        currentMap: data?.currentMap,
        ...(heartbeatState.gameState !== undefined ? { gameState: heartbeatState.gameState } : {}),
        timestamp: data?.timestamp || Date.now(),
      });
    });
  });

  return { botService, isAuthorizedBot };
}
