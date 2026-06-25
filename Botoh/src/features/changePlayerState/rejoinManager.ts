import { PlayerInfo } from "./playerList";
import { generalGameMode, GeneralGameMode } from "../changeGameState/changeGameModes";

export interface RejoinInfo {
  playerInfo: PlayerInfo;
  position: { x: number; y: number };
  leftGameTime: number;
  clearTimeoutId?: NodeJS.Timeout;
}

export class RejoinManager {
  private static instance: RejoinManager;
  private rejoinData: Map<string, RejoinInfo> = new Map();
  private expiredRejoinAuths: Set<string> = new Set();
  private readonly CLEAR_TIME = 30000; // 30 sec

  private constructor() {}

  public static getInstance(): RejoinManager {
    if (!RejoinManager.instance) {
      RejoinManager.instance = new RejoinManager();
    }
    return RejoinManager.instance;
  }

  public savePlayerData(
    auth: string,
    playerInfo: PlayerInfo,
    position: { x: number; y: number },
    leftGameTime: number,
  ): void {
    if (generalGameMode !== GeneralGameMode.GENERAL_RACE) {
      return;
    }

    const existingData = this.rejoinData.get(auth);
    if (existingData?.clearTimeoutId) {
      clearTimeout(existingData.clearTimeoutId);
    }

    const rejoinInfo: RejoinInfo = {
      playerInfo: clonePlayerInfoForRejoin(playerInfo),
      position: { ...position },
      leftGameTime,
    };

    rejoinInfo.playerInfo.canRejoin = true;

    this.expiredRejoinAuths.delete(auth);

    const timeoutId = setTimeout(() => {
      this.expirePlayerData(auth);
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
    this.expiredRejoinAuths.delete(auth);
  }

  public clearAllData(): void {
    for (const data of this.rejoinData.values()) {
      if (data.clearTimeoutId) {
        clearTimeout(data.clearTimeoutId);
      }
    }
    this.rejoinData.clear();
    this.expiredRejoinAuths.clear();
  }

  public hasRejoinData(auth: string): boolean {
    return this.rejoinData.has(auth);
  }

  public getAllRejoinData(): Map<string, RejoinInfo> {
    return new Map(this.rejoinData);
  }

  public hasExpiredRejoinData(auth: string): boolean {
    return this.expiredRejoinAuths.has(auth);
  }

  private expirePlayerData(auth: string): void {
    const data = this.rejoinData.get(auth);
    if (data?.clearTimeoutId) {
      clearTimeout(data.clearTimeoutId);
    }

    this.rejoinData.delete(auth);
    this.expiredRejoinAuths.add(auth);
  }
}

export const rejoinManager = RejoinManager.getInstance();

function clonePlayerInfoForRejoin(playerInfo: PlayerInfo): PlayerInfo {
  return {
    ...playerInfo,
    checkpointTimes: { ...playerInfo.checkpointTimes },
    bestSectorTimes: [...playerInfo.bestSectorTimes] as [number, number, number],
    currentLapSectorStatus: [...playerInfo.currentLapSectorStatus] as PlayerInfo["currentLapSectorStatus"],
    sectorTime: [...playerInfo.sectorTime],
    alertSent: { ...playerInfo.alertSent },
    previousPos: { ...playerInfo.previousPos },
    pits: {
      pitsNumber: playerInfo.pits.pitsNumber,
      pit: playerInfo.pits.pit.map((pit) => ({ ...pit })),
    },
    pitInitialPos: playerInfo.pitInitialPos
      ? { ...playerInfo.pitInitialPos }
      : undefined,
    pitFailures: playerInfo.pitFailures
      ? {
          ...playerInfo.pitFailures,
          tyres: [...playerInfo.pitFailures.tyres],
          perTyreTimes: [...playerInfo.pitFailures.perTyreTimes],
        }
      : undefined,
    pitSteps: playerInfo.pitSteps
      ? playerInfo.pitSteps.map((step) => ({
          ...step,
          statuses: [...step.statuses] as typeof step.statuses,
        }))
      : undefined,
    newPitState: playerInfo.newPitState
      ? { ...playerInfo.newPitState }
      : undefined,
    repairState: playerInfo.repairState
      ? {
          ...playerInfo.repairState,
          repairInitialPos: playerInfo.repairState.repairInitialPos
            ? { ...playerInfo.repairState.repairInitialPos }
            : undefined,
        }
      : undefined,
    xKeyState: playerInfo.xKeyState
      ? {
          ...playerInfo.xKeyState,
          pressTimes: [...playerInfo.xKeyState.pressTimes],
          releaseTimes: [...playerInfo.xKeyState.releaseTimes],
        }
      : undefined,
  };
}
