import { Server as SocketIOServer } from 'socket.io';

export interface BotMessage {
  type: 'chat:message';
  data: {
    player: string;
    message: string;
    timestamp: number;
    color: number | null;
    source: 'player' | 'system' | 'frontend';
  };
}

export interface BotLogMessage {
  type: 'log:message';
  data: {
    message: string;
    timestamp: number;
    color: number | null;
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
      this.broadcastToClients('chat:message', data);
    });

    socket.on('log:message', (data: BotLogMessage) => {
      this.broadcastToClients('log:message', data);
    });
  }

  sendToBot(event: string, data: any) {
    if (this.botSocket) {
      this.botSocket.emit(event, data);
    } else {
      console.log('Bot not connected, cannot send:', event, data);
    }
  }

  broadcastToClients(event: string, data: any) {
    this.io.emit(event, data);
  }
}
