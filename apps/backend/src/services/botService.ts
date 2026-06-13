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
    message: string | {
      pt: string;
      en: string;
      es: string;
      fr?: string;
      tr?: string;
    };
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
      if (this.botSocket === socket) {
        this.botSocket = null;
        console.log('Bot disconnected from backend');
      }
    });

    socket.on('chat:message', (data: BotMessage) => {
      this.broadcastToClients('chat:message', data);
    });

    socket.on('log:message', (data: BotLogMessage) => {
      this.broadcastToClients('log:message', data);
    });
  }

  isCurrentBotSocket(socket: any): boolean {
    return this.botSocket === socket;
  }

  sendToBot(event: string, data: any, callback?: (response: any) => void) {
    if (this.botSocket) {
      this.botSocket.timeout(5000).emit(event, data, (error: Error | null, response: any) => {
        if (error) {
          callback?.({ success: false, code: 'bot_timeout' });
          return;
        }

        callback?.(response ?? { success: true });
      });
    } else {
      console.log('Bot not connected, cannot send:', event, data);
      callback?.({ success: false, code: 'bot_not_connected' });
    }
  }

  requestCurrentMap(reason: string): Promise<{ success: boolean; mapName: string | null; code?: string }> {
    return new Promise((resolve) => {
      this.sendToBot('room:requestCurrentMap', { reason }, (response) => {
        resolve({
          success: response?.success === true && typeof response?.mapName === 'string',
          mapName: typeof response?.mapName === 'string' ? response.mapName : null,
          code: response?.code,
        });
      });
    });
  }

  broadcastToClients(event: string, data: any) {
    this.io.emit(event, data);
  }
}
