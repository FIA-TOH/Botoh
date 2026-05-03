import { Server as SocketIOServer } from 'socket.io';

export interface BotMessage {
  type: 'chat:message';
  data: {
    player: string;
    message: string;
    timestamp: number;
  };
}

export class BotService {
  private botSocket: any = null;
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  registerBot(socket: any) {
    this.botSocket = socket;
    console.log('Bot connected to backend');
    
    socket.on('disconnect', () => {
      this.botSocket = null;
      console.log('Bot disconnected from backend');
    });

    socket.on('chat:message', (data: BotMessage) => {
      console.log('Received chat:message from bot:', data);
      this.broadcastToClients('chat:message', data);
    });
  }

  sendToBot(event: string, data: any) {
    if (this.botSocket) {
      this.botSocket.emit(event, data);
    } else {
      console.log('Bot not connected, cannot send:', event, data);
    }
  }

  private broadcastToClients(event: string, data: any) {
    this.io.emit(event, data);
  }
}
