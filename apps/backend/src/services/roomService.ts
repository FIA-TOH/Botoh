import { RoomState } from '../types';

/**
 * Service para gerenciar informações do Room/Haxball
 * Conecta com o sistema do bot para obter dados em tempo real
 */

class RoomService {
  private currentMap: string | null = null;
  private roomState: RoomState | null = null;
  private lastUpdate: Date | null = null;
  private isGameStateSynced = false;

  /**
   * Obtém o mapa atual do Room
   */
  getCurrentMap(): string | null {
    // Tentar obter do estado do Room primeiro
    if (this.roomState?.currentMap) {
      return this.roomState.currentMap;
    }

    // Tentar obter do cache
    if (this.currentMap && this.lastUpdate) {
      // Verificar se o cache ainda é válido (5 minutos)
      const now = new Date();
      const cacheAge = now.getTime() - this.lastUpdate.getTime();
      if (cacheAge < 5 * 60 * 1000) {
        return this.currentMap;
      }
    }

    // Tentar obter do sistema do bot
    return this.getBotCurrentMap();
  }

  /**
   * Obtém informações completas do Room
   */
  getRoomState(): RoomState | null {
    return this.roomState;
  }

  getGameStateSnapshot(): { gameState: RoomState['gameState']; isSynced: boolean } {
    return {
      gameState: this.roomState?.gameState ?? null,
      isSynced: this.isGameStateSynced,
    };
  }

  /**
   * Atualiza o estado do Room
   */
  updateRoomState(state: Partial<RoomState>): void {
    this.roomState = {
      ...this.roomState,
      ...state,
      lastUpdate: new Date()
    } as RoomState;

    // Atualizar cache do mapa
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

  /**
   * Obtém o mapa atual do sistema do bot
   */
  private getBotCurrentMap(): string | null {
    try {
      // Tentar obter do sistema do bot Haxball
      // Isso pode vir de várias fontes:
      
      // 1. Variáveis globais do bot
      if (typeof global !== 'undefined' && (global as any).haxballRoom) {
        const room = (global as any).haxballRoom;
        if (room.currentMap) {
          return room.currentMap;
        }
      }

      // 2. Sistema de arquivos (ler do arquivo de estado)
      const fs = require('fs');
      const path = require('path');
      
      // Tentar ler de um arquivo de estado do Room
      const stateFile = path.join(process.cwd(), 'room-state.json');
      console.log('🗺️ Procurando arquivo de estado:', stateFile);
      
      if (fs.existsSync(stateFile)) {
        console.log('📁 Arquivo de estado encontrado');
        const stateData = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
        if (stateData.currentMap) {
          console.log('🗺️ Mapa encontrado no arquivo:', stateData.currentMap);
          this.updateRoomState(stateData);
          return stateData.currentMap;
        }
      } else {
        console.log('❌ Arquivo de estado não encontrado');
      }

      // 3. Variáveis de ambiente
      const envMap = process.env.CURRENT_MAP;
      if (envMap) {
        return envMap;
      }

      // 4. Configuração padrão (para desenvolvimento)
      const defaultMap = process.env.DEFAULT_MAP || 'imola';
      if (process.env.NODE_ENV === 'development') {
        return defaultMap;
      }

      return null;
    } catch (error) {
      console.error('Error getting bot current map:', error);
      return null;
    }
  }

  /**
   * Força atualização do estado do Room
   */
  async refreshRoomState(): Promise<void> {
    try {
      // Socket events from the bot are the freshest source. Fallbacks are only
      // used before the bot has pushed a map into this service.
      const currentMap = this.roomState?.currentMap || this.currentMap || this.getBotCurrentMap();
      
      this.updateRoomState({
        currentMap,
        playerCount: this.roomState?.playerCount || 0,
        gameState: this.roomState?.gameState ?? null,
        lastUpdate: new Date()
      });
    } catch (error) {
      console.error('Error refreshing room state:', error);
    }
  }

  /**
   * Verifica se o Room está ativo
   */
  isRoomActive(): boolean {
    return this.roomState?.isOnline === true && this.roomState.lastUpdate > new Date(Date.now() - 60000);
  }

  /**
   * Obtém estatísticas do Room
   */
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
        : null
    };
  }
}

// Export singleton instance
const roomService = new RoomService();
export default roomService;
