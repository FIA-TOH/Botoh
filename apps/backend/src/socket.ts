import { Server as SocketIOServer } from 'socket.io';
import { BotService } from './services/botService';

export function setupSocketHandlers(io: SocketIOServer) {
  const botService = new BotService(io);

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    
    socket.on('chat:send', (data) => {
      console.log(`Chat message received from ${socket.id}:`, data);
      botService.sendToBot('chat:send', data);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return { botService };
}
