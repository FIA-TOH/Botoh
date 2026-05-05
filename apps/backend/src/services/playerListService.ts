import { BotService } from './botService';

export interface PlayerData {
  id: number;
  name: string;
  team: number;
  admin: boolean;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  avatar?: string;
  country?: string;
  conn: string;
  auth?: string;
}

export interface PlayerListUpdate {
  timestamp: number;
  players: PlayerData[];
  playerCount: number;
}

export class PlayerListService {
  private botService: BotService;
  private broadcastInterval: NodeJS.Timeout | null = null;
  private isBroadcasting = false;

  constructor(botService: BotService) {
    this.botService = botService;
  }

  startBroadcasting() {
    if (this.isBroadcasting) return;
    
    this.isBroadcasting = true;
    console.log('🔄 Starting player list broadcasting (5 times/sec)');
    
    // Broadcast 5 times per second (every 200ms)
    this.broadcastInterval = setInterval(() => {
      this.broadcastPlayerList();
    }, 200);
  }

  stopBroadcasting() {
    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval);
      this.broadcastInterval = null;
      this.isBroadcasting = false;
      console.log('⏹️ Stopped player list broadcasting');
    }
  }

  private async broadcastPlayerList() {
    try {
      // Get room from global scope (set by bot)
      const room = (global as any).room;
      
      if (!room) {
        console.log('❌ No room available for player list');
        return;
      }

      const playerList = room.getPlayerList();
      
      const players: PlayerData[] = [];

      for (const player of playerList) {
        // Skip invalid players
        if (!player || typeof player !== 'object') {
          console.log('⚠️ Skipping invalid player:', player);
          continue;
        }

        players.push({
          id: player.id || 0,
          name: player.name || 'Unknown',
          team: player.team || 0,
          admin: player.admin || false,
          position: {
            x: player.position && typeof player.position.x === 'number' 
              ? Math.round(player.position.x * 100) / 100 
              : 0,
            y: player.position && typeof player.position.y === 'number' 
              ? Math.round(player.position.y * 100) / 100 
              : 0
          },
          velocity: {
            x: player.velocity && typeof player.velocity.x === 'number' 
              ? Math.round(player.velocity.x * 100) / 100 
              : 0,
            y: player.velocity && typeof player.velocity.y === 'number' 
              ? Math.round(player.velocity.y * 100) / 100 
              : 0
          },
          avatar: player.avatar || undefined,
          country: player.country || undefined,
          conn: player.conn || '',
          auth: player.auth || ''
        });
      }

      const update: PlayerListUpdate = {
        timestamp: Date.now(),
        players,
        playerCount: players.length
      };

      // Send to all frontend clients
      this.botService.broadcastToClients('playerList:update', update);
      
    } catch (error) {
      console.error('❌ Error broadcasting player list:', error);
    }
  }
}
