import { PlayerInfo } from "./playerList";
import { generalGameMode, GeneralGameMode } from "../changeGameState/changeGameModes";

export interface RejoinInfo {
  playerInfo: PlayerInfo;
  position: { x: number; y: number };
  leftTime: number;
  clearTimeoutId?: NodeJS.Timeout;
}

export class RejoinManager {
  private static instance: RejoinManager;
  private rejoinData: Map<string, RejoinInfo> = new Map();
  private readonly CLEAR_TIME = 30000; // 30 sec

  private constructor() {}

  public static getInstance(): RejoinManager {
    if (!RejoinManager.instance) {
      RejoinManager.instance = new RejoinManager();
    }
    return RejoinManager.instance;
  }

  public savePlayerData(auth: string, playerInfo: PlayerInfo, position: { x: number; y: number }): void {
    if (generalGameMode !== GeneralGameMode.GENERAL_RACE) {
      return;
    }

    const existingData = this.rejoinData.get(auth);
    if (existingData?.clearTimeoutId) {
      clearTimeout(existingData.clearTimeoutId);
    }

    const rejoinInfo: RejoinInfo = {
      playerInfo: { ...playerInfo },
      position: { ...position },
      leftTime: Date.now()
    };

    rejoinInfo.playerInfo.canRejoin = true;

    const timeoutId = setTimeout(() => {
      this.clearPlayerData(auth);
    }, this.CLEAR_TIME);

    rejoinInfo.clearTimeoutId = timeoutId;
    this.rejoinData.set(auth, rejoinInfo);
  }

  public getPlayerData(auth: string): RejoinInfo | undefined {
    return this.rejoinData.get(auth);
  }

  public clearPlayerData(auth: string): void {
    const data = this.rejoinData.get(auth);
    if (data?.clearTimeoutId) {
      clearTimeout(data.clearTimeoutId);
    }
    this.rejoinData.delete(auth);
  }

  public clearAllData(): void {
    for (const data of this.rejoinData.values()) {
      if (data.clearTimeoutId) {
        clearTimeout(data.clearTimeoutId);
      }
    }
    this.rejoinData.clear();
  }

  public hasRejoinData(auth: string): boolean {
    return this.rejoinData.has(auth);
  }

  public getAllRejoinData(): Map<string, RejoinInfo> {
    return new Map(this.rejoinData);
  }
}

export const rejoinManager = RejoinManager.getInstance();
