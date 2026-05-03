// Import and run the complete Botoh bot
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../Botoh/.env' });

// Add backend communication to existing Botoh bot
import { io } from 'socket.io-client';

let backendSocket: any = null;

async function setupBackendCommunication() {
  const socket = io('http://localhost:3001');
  
  socket.on('connect', () => {
    console.log('Botoh bot connected to backend');
    socket.emit('register:bot');
  });

  socket.on('chat:send', async (data: any) => {
    console.log('Received chat:send from backend:', data);
    
    // Import room and send chat message to Haxball
    try {
      const { roomPromise } = await import('../../../Botoh/src/room');
      const room = await roomPromise;
      
      if (room && data.message) {
        room.sendAnnouncement(`[Frontend] ${data.message}`, undefined, 0xFFFFFF);
        console.log('Sent message to Haxball room:', data.message);
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
  const room = await roomPromise;
  
  console.log(`✅ Complete Botoh bot started with backend communication`);
}

main().catch((err) => {
  console.error("Error on start the bot:", err);
});
