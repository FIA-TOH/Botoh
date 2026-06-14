import { RoomState } from '../types';

class RoomService {
  private currentMap: string | null = null;
  private roomState: RoomState | null = null;
  private lastUpdate: Date | null = null;
  private isGameStateSynced = false;
  private currentMapRequester: ((reason: string) => Promise<string | null>) | null = null;

  setCurrentMapRequester(requester: (reason: string) => Promise<string | null>): void {
    this.currentMapRequester = requester;
  }

  getCurrentMap(): string | null {
    if (this.roomState?.currentMap) {
      return this.roomState.currentMap;
    }

    if (this.currentMap) {
      return this.currentMap;
    }

    return this.getBotCurrentMapFallback();
  }

  getRoomState(): RoomState | null {
    return this.roomState;
  }

  getGameStateSnapshot(): { gameState: RoomState['gameState']; isSynced: boolean } {
    return {
      gameState: this.roomState?.gameState ?? null,
      isSynced: this.isGameStateSynced,
    };
  }

  updateRoomState(state: Partial<RoomState>): void {
    this.roomState = {
      ...this.roomState,
      ...state,
      lastUpdate: new Date(),
    } as RoomState;

    if (state.currentMap) {
      this.currentMap = state.currentMap;
      this.lastUpdate = new Date();
    }
  }

  updateGameState(gameState: RoomState['gameState']): void {
    this.isGameStateSynced = true;
    this.updateRoomState({ gameState });
  }

  markRoomOpened(state: Partial<RoomState>): void {
    this.updateRoomState({
      ...state,
      isOnline: true,
      openedAt: state.openedAt || this.roomState?.openedAt || new Date(),
    });
  }

  markRoomHeartbeat(state: Partial<RoomState> = {}): void {
    if (Object.prototype.hasOwnProperty.call(state, 'gameState')) {
      this.isGameStateSynced = true;
    }

    this.updateRoomState({
      ...state,
      isOnline: true,
    });
  }

  markRoomOffline(): void {
    if (!this.roomState) return;

    this.isGameStateSynced = true;
    this.updateRoomState({
      isOnline: false,
      gameState: null,
      playerCount: 0,
    });
  }

  private getBotCurrentMapFallback(): string | null {
    try {
      if (typeof global !== 'undefined' && (global as any).haxballRoom) {
        const room = (global as any).haxballRoom;
        if (room.currentMap) {
          return room.currentMap;
        }
      }

      const fs = require('fs');
      const path = require('path');
      const stateFile = path.join(process.cwd(), 'room-state.json');

      if (fs.existsSync(stateFile)) {
        const stateData = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
        if (stateData.currentMap) {
          this.updateRoomState(stateData);
          return stateData.currentMap;
        }
      }

      const envMap = process.env.CURRENT_MAP;
      if (envMap) {
        return envMap;
      }

      const defaultMap = process.env.DEFAULT_MAP || 'imola';
      if (process.env.NODE_ENV === 'development') {
        return defaultMap;
      }

      return null;
    } catch (error) {
      console.error('[roomService] error reading current map fallback:', error);
      return null;
    }
  }

  async refreshRoomState(options: { forceBotRefresh?: boolean; reason?: string } = {}): Promise<void> {
    try {
      if (options.forceBotRefresh && this.currentMapRequester) {
        const requestedMap = await this.currentMapRequester(options.reason || 'refreshRoomState');

        if (requestedMap) {
          this.updateRoomState({ currentMap: requestedMap });
        }
      }

      const currentMap = this.roomState?.currentMap || this.currentMap || this.getBotCurrentMapFallback();

      this.updateRoomState({
        currentMap,
        playerCount: this.roomState?.playerCount || 0,
        gameState: this.roomState?.gameState ?? null,
        lastUpdate: new Date(),
      });
    } catch (error) {
      console.error('[roomService] error refreshing room state:', error);
    }
  }

  isRoomActive(): boolean {
    return this.roomState?.isOnline === true && this.roomState.lastUpdate > new Date(Date.now() - 60000);
  }

  getRoomStats(): {
    playerCount: number;
    gameState: string | null;
    currentMap: string | null;
    uptime: number | null;
  } {
    return {
      playerCount: this.roomState?.playerCount || 0,
      gameState: this.roomState?.gameState ?? null,
      currentMap: this.getCurrentMap(),
      uptime: this.roomState?.startTime
        ? Date.now() - this.roomState.startTime.getTime()
        : null,
    };
  }
}

const roomService = new RoomService();
export default roomService;
