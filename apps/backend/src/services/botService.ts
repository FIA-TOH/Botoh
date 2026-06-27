import { Server as SocketIOServer } from 'socket.io';

export interface BotMessage {
  type: 'chat:message';
  data: {
    player: string;
    message: string;
    timestamp: number;
    color: number | null;
    source: 'player' | 'system' | 'frontend';
    channel?: 'all' | 'team' | 'player';
    sender?: ChatParticipant;
    target?: ChatTarget;
    recipients?: ChatParticipant[];
  };
}

interface ChatParticipant {
  playerId?: number;
  playerName?: string | null;
  username?: string | null;
  teamId?: string | null;
  teamName?: string | null;
}

type ChatTarget =
  | { type: 'all' }
  | {
      type: 'team';
      teamId?: string | null;
      teamName?: string | null;
      playerIds?: number[];
      playerNames?: string[];
      usernames?: string[];
    }
  | {
      type: 'player';
      playerId?: number | null;
      playerName?: string | null;
      username?: string | null;
    };

export interface ChatVisibilityContext {
  userId?: string | null;
  username?: string | null;
  aliases?: Array<string | null | undefined>;
  teamId?: string | null;
  teamName?: string | null;
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
      this.broadcastChatMessage(data);
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

  private normalizeComparableValue(value?: string | number | null) {
    return String(value ?? '').trim().toLowerCase();
  }

  private hasMatchingValue(values: Array<string | number | null | undefined>, candidates: Set<string>) {
    return values.some((value) => {
      const normalizedValue = this.normalizeComparableValue(value);
      return Boolean(normalizedValue) && candidates.has(normalizedValue);
    });
  }

  private canSeeChatMessage(message: BotMessage['data'], visibility?: ChatVisibilityContext) {
    const channel = message.channel ?? message.target?.type ?? 'all';

    if (message.source === 'player' || message.source === 'system' || channel === 'all') {
      return true;
    }

    if (!visibility) return false;

    const userAliases = new Set(
      [visibility.username, ...(visibility.aliases ?? [])]
        .map((value) => this.normalizeComparableValue(value))
        .filter(Boolean),
    );
    const userTeams = new Set(
      [visibility.teamId, visibility.teamName]
        .map((value) => this.normalizeComparableValue(value))
        .filter(Boolean),
    );
    const sentByCurrentUser = this.hasMatchingValue(
      [message.player, message.sender?.username, message.sender?.playerName],
      userAliases,
    );

    if (channel === 'team') {
      const target = message.target?.type === 'team' ? message.target : null;
      const teamMatches = this.hasMatchingValue(
        [
          target?.teamId,
          target?.teamName,
          ...((message.recipients ?? []).flatMap((recipient) => [recipient.teamId, recipient.teamName])),
        ],
        userTeams,
      );

      return sentByCurrentUser && teamMatches;
    }

    if (channel === 'player') {
      const target = message.target?.type === 'player' ? message.target : null;
      const addressedToCurrentUser = this.hasMatchingValue(
        [
          target?.username,
          target?.playerName,
          ...((message.recipients ?? []).flatMap((recipient) => [recipient.username, recipient.playerName])),
        ],
        userAliases,
      );

      return sentByCurrentUser || addressedToCurrentUser;
    }

    return false;
  }

  private broadcastChatMessage(data: BotMessage) {
    this.io.sockets.sockets.forEach((socket) => {
      if (this.canSeeChatMessage(data.data, socket.data?.chatVisibility)) {
        socket.emit('chat:message', data);
      }
    });
  }
}
