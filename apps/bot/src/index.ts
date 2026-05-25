// Import and run the complete Botoh bot
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
dotenv.config({ path: '../../Botoh/.env' });

// Add backend communication to existing Botoh bot
import { io } from 'socket.io-client';

let backendSocket: any = null;
let room: any = null;
let roomHeartbeatInterval: NodeJS.Timeout | null = null;

const LOCAL_BACKEND_WS_URL = 'http://localhost:3001';

function isRemoteMode() {
  return process.argv.includes('--remote') || process.env.BOT_BACKEND_MODE === 'remote';
}

function getBackendWsUrl() {
  const configuredUrl = process.env.BACKEND_WS_URL || process.env.BACKEND_URL;

  if (configuredUrl) {
    return configuredUrl;
  }

  if (isRemoteMode()) {
    throw new Error('BACKEND_WS_URL is required when running the bot in remote mode.');
  }

  return LOCAL_BACKEND_WS_URL;
}

async function emitRoomHeartbeat() {
  if (!backendSocket?.emit || !room?.getPlayerList) return;

  try {
    const { CIRCUIT_FILE_NAMES, currentMapIndex } = await import('../../../Botoh/src/features/zones/maps');
    const hasGameStateSnapshot = Object.prototype.hasOwnProperty.call(global, 'pitWallGameState');

    backendSocket.emit('room:heartbeat', {
      playerCount: room.getPlayerList().length,
      currentMap: CIRCUIT_FILE_NAMES[currentMapIndex] ?? null,
      ...(hasGameStateSnapshot
        ? { gameState: (global as any).pitWallGameState }
        : {}),
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Failed to emit room heartbeat snapshot:', error);
  }
}

async function setupBackendCommunication() {
  const backendWsUrl = getBackendWsUrl();
  const socket = io(backendWsUrl, {
    auth: {
      botToken: process.env.BOT_SOCKET_TOKEN || undefined,
    },
  });
  
  socket.on('connect', () => {
    console.log(`Botoh bot connected to backend: ${backendWsUrl}`);
    socket.emit('register:bot', {
      token: process.env.BOT_SOCKET_TOKEN || undefined,
    });
    emitRoomHeartbeat();
  });

  socket.on('connect_error', (error) => {
    console.error('Botoh bot failed to connect to backend:', error.message);
  });

  socket.on('chat:send', async (data: any) => {  
    // Data is coming as a string, not an object
    const message = typeof data === 'string' ? data : data.message;
    const player = typeof data === 'object' && data.player
      ? data.player
      : 'Frontend';
    const target = typeof data === 'object' && data.target
      ? data.target
      : { type: 'all' };
    
    try {
      // Import the getRoom function from Botoh
      const { getRoom } = await import('../../../Botoh/src/room');
      const room = await getRoom();
      
      if (room && message && !message.trim().startsWith('!')) {
        const { playerList } = await import('../../../Botoh/src/features/changePlayerState/playerList');
        const { getLeagueScuderia } = await import('../../../Botoh/src/features/scuderias/scuderias');
        const { MESSAGES, getPlayerLanguage } = await import('../../../Botoh/src/features/chat/messages');
        const { mute_mode } = await import('../../../Botoh/src/features/chat/toggleMuteMode');

        if (mute_mode) {
          return;
        }

        const recipients = room.getPlayerList().filter((roomPlayer: PlayerObject) => {
          if (target.type === 'all') {
            return true;
          }

          if (target.type === 'player') {
            return roomPlayer.name === target.playerName;
          }

          if (target.type === 'team') {
            const playerState = playerList[roomPlayer.id];
            const scuderia = getLeagueScuderia(playerState?.leagueScuderia);
            return scuderia?.name === target.teamName;
          }

          return false;
        });
        recipients.forEach((recipient: PlayerObject) => {
          const language = getPlayerLanguage(recipient.id);
          const channelLabel =
            target.type === 'team'
              ? MESSAGES.CHAT_CHANNEL_TEAM()[language]
              : target.type === 'player'
                ? MESSAGES.CHAT_CHANNEL_PRIVATE()[language]
                : MESSAGES.CHAT_CHANNEL_ALL()[language];
          const formattedMessage = `[\u{1F4FB} ${player} - ${channelLabel}] ${message}`;
          room.sendAnnouncement(formattedMessage, recipient.id, 0xFFFFFF);
        });

        if (target.type === 'all') {
          const { sendChatMessageToWebsite } = await import('../../../Botoh/src/features/website/sendToWebsite');
          sendChatMessageToWebsite({
            player,
            message,
            timestamp: Date.now(),
            color: null,
            source: 'frontend',
          });
        }
      } else {
        console.log('No room or message:', { 
          room: !!room, 
          message: message
        });
      }
    } catch (error) {
      console.error('Error sending message to Haxball room:', error);
    }
  });

  socket.on('pit:call', async (data: { playerName?: string }) => {
    if (!data?.playerName) return;

    try {
      const { getRoom } = await import('../../../Botoh/src/room');
      const room = await getRoom();
      const playerToCall = room?.getPlayerList().find(
        (roomPlayer: PlayerObject) => roomPlayer.name === data.playerName,
      );

      if (!room || !playerToCall) return;

      room.sendAnnouncement(
        '\u{1F4FB} BOX BOX BOX BOX',
        playerToCall.id,
        0xffff00,
      );
    } catch (error) {
      console.error('Error sending pit call to Haxball room:', error);
    }
  });

  backendSocket = socket;
  
  // Add backend communication to global scope for Botoh modules
  (global as any).backendSocket = socket;
  
  return socket;
}

setupBackendCommunication();

process.on("beforeExit", (code) => {
  console.error("beforeExit with code:", code);
});

process.on("SIGINT", () => {
  console.error("Received SIGINT (Ctrl+C)");
  if (roomHeartbeatInterval) clearInterval(roomHeartbeatInterval);
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.error("Received SIGTERM");
  if (roomHeartbeatInterval) clearInterval(roomHeartbeatInterval);
  process.exit(0);
});

// Import and run the full Botoh bot
async function main() {
  console.log(`🔧 Starting complete Botoh bot with backend integration`);
  
  // Import the original Botoh entry point
  const { roomPromise } = await import('../../../Botoh/src/room');
  room = await roomPromise;
  
  // Set room globally for player list service
  (global as any).room = room;
  emitRoomHeartbeat();

  roomHeartbeatInterval = setInterval(emitRoomHeartbeat, 30000);
  
  // Start player list broadcasting after room is ready
  if (backendSocket) {
    const { PlayerListService } = await import('../../backend/src/services/playerListService');
    
    // Create a minimal botService-like object that emits to frontend clients
    const mockBotService = {
      broadcastToClients: (event: string, data: any) => {
        // Emit to backend socket.io server, which will broadcast to frontend clients
        if (backendSocket && backendSocket.emit) {
          backendSocket.emit('broadcast:toFrontend', { event, data });
        }
      }
    };
    
    const playerListService = new PlayerListService(mockBotService as any);
    playerListService.startBroadcasting();
  }
  
  console.log(`✅ Complete Botoh bot started with backend communication`);
}

main().catch((err) => {
  console.error("Error on start the bot:", err);
});
