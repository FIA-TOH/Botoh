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
    console.log('Received chat:send from backend:', data);
    
    // Data is coming as a string, not an object
    const message = typeof data === 'string' ? data : data.message;
    
    try {
      // Import the getRoom function from Botoh
      const { getRoom } = await import('../../../Botoh/src/room');
      const room = await getRoom();
      
      if (room && message) {
        room.sendAnnouncement(`[Frontend] ${message}`, undefined, 0xFFFFFF);
      } else {
        console.log('❌ No room or message:', { 
          room: !!room, 
          message: message
        });
      }
    } catch (error) {
      console.error('Error sending message to Haxball room:', error);
    }
  });

  backendSocket = socket;
  
  // Add backend communication to global scope for Botoh modules
  (global as any).backendSocket = socket;
  
  return socket;
}

setupBackendCommunication();

process.on("beforeExit", (code) => {
  console.error("⚠️ beforeExit with code:", code);
});

process.on("SIGINT", () => {
  console.error("⛔ Received SIGINT (Ctrl+C)");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.error("⛔ Received SIGTERM");
  process.exit(0);
});

// Import and run the full Botoh bot
async function main() {
  console.log(`🚀 Starting complete Botoh bot with backend integration`);
  
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
  
  console.log(`✅ Complete Botoh bot started with backend communication`);
}

main().catch((err) => {
  console.error("Error on start the bot:", err);
});
