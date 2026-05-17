// Import and run the complete Botoh bot
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../Botoh/.env' });

// Add backend communication to existing Botoh bot
import { io } from 'socket.io-client';

let backendSocket: any = null;
let room: any = null;

async function setupBackendCommunication() {
  const socket = io('http://localhost:3001');
  
  socket.on('connect', () => {
    console.log('Botoh bot connected to backend');
    socket.emit('register:bot');
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
        console.log('âŒ No room or message:', { 
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
  console.error("âš ï¸ beforeExit with code:", code);
});

process.on("SIGINT", () => {
  console.error("â›” Received SIGINT (Ctrl+C)");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.error("â›” Received SIGTERM");
  process.exit(0);
});

// Import and run the full Botoh bot
async function main() {
  console.log(`ðŸš€ Starting complete Botoh bot with backend integration`);
  
  // Import the original Botoh entry point
  const { roomPromise } = await import('../../../Botoh/src/room');
  room = await roomPromise;
  
  // Set room globally for player list service
  (global as any).room = room;
  
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
  
  console.log(`âœ… Complete Botoh bot started with backend communication`);
}

main().catch((err) => {
  console.error("Error on start the bot:", err);
});
