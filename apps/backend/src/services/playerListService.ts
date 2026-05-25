import { BotService } from './botService';
import { playerList as botPlayerState } from '../../../../Botoh/src/features/changePlayerState/playerList';
import { getLeagueScuderia } from '../../../../Botoh/src/features/scuderias/scuderias';
import { Teams } from '../../../../Botoh/src/features/changeGameState/teams';
import { Tires } from '../../../../Botoh/src/features/tires&pits/tires';
import { GameMode, gameMode } from '../../../../Botoh/src/features/changeGameState/changeGameModes';
import { qualiTime } from '../../../../Botoh/src/features/commands/gameMode/qualy/qualiMode';
import { currentSessionLap, laps } from '../../../../Botoh/src/features/zones/laps';
import { currentTime } from '../../../../Botoh/src/features/roomFeatures/gameTick';
import { positionList } from '../../../../Botoh/src/features/commands/gameMode/race/positionList';
import { getPlayersOrderedByQualiTime } from '../../../../Botoh/src/features/commands/gameMode/qualy/playerTime';
import {
  getRaceControlState,
  RaceControlState,
} from '../../../../Botoh/src/features/commands/flagsAndVSC/raceControl';
import { CIRCUITS, currentMapIndex } from '../../../../Botoh/src/features/zones/maps';
import { currentWeather } from '../../../../Botoh/src/features/weather/currentWeather';
import {
  getWeatherChartData,
  WeatherChartData,
} from '../../../../Botoh/src/features/weather/weatherManager';
import {
  getLastWeatherAnnouncement,
  LastWeatherAnnouncement,
} from '../../../../Botoh/src/features/weather/rain/weatherReportAnnouncer';
import {
  getLapHistory,
  getPaceStats,
  PaceStats,
} from '../../../../Botoh/src/features/zones/laps/lapHistory';
import { mute_mode } from '../../../../Botoh/src/features/chat/toggleMuteMode';
import { gameState } from '../../../../Botoh/src/features/changeGameState/gameState';

export interface PlayerPositionData {
  id: number;
  name: string;
  team: Teams;
  admin: boolean;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  avatar?: string;
  country?: string;
  conn: string;
  auth?: string;
}

export interface PlayerData extends PlayerPositionData {
  ip: string;
  isInTheRoom: boolean;
  leagueScuderia: string | null;
  totalTime: number;
  currentLap: number;
  lapTime: number;
  bestTime: string | null;
  bestSectorTimes: [string | null, string | null, string | null];
  tires: Tires;
  wear: number;
  lapsOnCurrentTire: number;
  inPitLane: boolean;
  inPitStop: boolean;
  pitCount: number;
  drs: boolean;
  kers: number;
  gas: number;
  isManagingTires: boolean;
  tireBlowWarning: boolean;
  isTyreBlowed: boolean;
  carDamage: number;
  racePosition: number | null;
  currentSector: number;
  checkpointTimes: Record<string, number>;
  paceStats: PaceStats;
  gapToLeader: string;
  gapToNext: string;
  shortName: string;
  driverNumber: number;
  isLogged: boolean;
  isFirstDriver: boolean;
  scuderiaColor: number | null;
  isOut: boolean;
}

export interface PlayerPositionsUpdate {
  timestamp: number;
  players: PlayerPositionData[];
  playerCount: number;
}

export interface PlayerListUpdate {
  timestamp: number;
  players: PlayerData[];
  standings: PlayerData[];
  playerCount: number;
  raceSession: RaceSessionData;
}

export type RaceFlag =
  | 'GREEN'
  | 'YELLOW'
  | 'RED'
  | 'BLUE'
  | 'BLACK'
  | 'SAFETY'
  | 'VIRTUAL_SAFETY';

export interface RaceSessionData {
  gameState: 'running' | 'paused' | null;
  sessionType: GameMode;
  currentTimePassed: number;
  totalTime: number | null;
  currentLap: number;
  totalLaps: number;
  flag: RaceFlag;
  isChatMuted: boolean;
  pitGap: {
    value: number;
    isEstimated: boolean;
  };
  weather: WeatherSessionData;
}

export interface WeatherSnapshot {
  rain: number;
  wet: number;
}

export interface WeatherSessionData {
  global: WeatherSnapshot;
  sectors: {
    sector1: WeatherSnapshot;
    sector2: WeatherSnapshot;
    sector3: WeatherSnapshot;
  };
  lastAnnouncement: LastWeatherAnnouncement | null;
  chart: WeatherChartData | null;
}

function formatLapTime(time: number | undefined): string | null {
  if (!Number.isFinite(time) || time === Number.MAX_VALUE) return null;

  const safeTime = Math.max(0, time ?? 0);
  const minutes = Math.floor(safeTime / 60);
  const seconds = safeTime - minutes * 60;

  return `${minutes}:${seconds.toFixed(3).padStart(6, '0')}`;
}

function getRaceFlag(): RaceFlag {
  const raceControl = getRaceControlState();

  if (raceControl.neutralization === RaceControlState.SafetyCar) {
    return 'SAFETY';
  }

  if (raceControl.neutralization === RaceControlState.VirtualSafetyCar) {
    return 'VIRTUAL_SAFETY';
  }

  switch (raceControl.flag) {
    case RaceControlState.YellowFlag:
      return 'YELLOW';
    case RaceControlState.RedFlag:
      return 'RED';
    case RaceControlState.BlueFlag:
      return 'BLUE';
    case RaceControlState.BlackFlag:
      return 'BLACK';
    case RaceControlState.GreenFlag:
    default:
      return 'GREEN';
  }
}

function getRaceSessionData(): RaceSessionData {
  const circuitPitGap = CIRCUITS[currentMapIndex]?.info?.pitGap;

  return {
    gameState: gameState ?? null,
    sessionType: gameMode,
    currentTimePassed: currentTime,
    totalTime:
      gameMode === GameMode.QUALY || gameMode === GameMode.HARD_QUALY
        ? qualiTime * 60
        : null,
    currentLap: currentSessionLap,
    totalLaps: laps,
    flag: getRaceFlag(),
    isChatMuted: mute_mode,
    pitGap: {
      value: circuitPitGap ?? 40,
      isEstimated: circuitPitGap === undefined,
    },
    weather: {
      global: {
        rain: currentWeather.rainGlobal,
        wet: currentWeather.wetAvg,
      },
      sectors: {
        sector1: {
          rain: currentWeather.rainS1,
          wet: currentWeather.wetS1,
        },
        sector2: {
          rain: currentWeather.rainS2,
          wet: currentWeather.wetS2,
        },
        sector3: {
          rain: currentWeather.rainS3,
          wet: currentWeather.wetS3,
        },
      },
      lastAnnouncement: getLastWeatherAnnouncement(),
      chart: getWeatherChartData(),
    },
  };
}

function buildPaceStatsFromLaps(laps: number[]): PaceStats {
  const lastFive = laps.slice(-5);
  const lastFiveAverage =
    lastFive.length > 0
      ? lastFive.reduce((sum, lap) => sum + lap, 0) / lastFive.length
      : null;
  const lastLap = laps.length > 0 ? laps[laps.length - 1] : null;

  return {
    fastestLap: laps.length > 0 ? Math.min(...laps) : null,
    lastFiveAverage,
    lastLap,
    lastLapComparedToAverage:
      lastLap !== null && lastFiveAverage !== null
        ? lastLap - lastFiveAverage
        : null,
    completedLaps: laps.length,
  };
}

function getPitWallPaceStats(playerId: number): PaceStats {
  const state = botPlayerState[playerId];
  const recordedLaps = getLapHistory(playerId);
  const openingLapTime = state?.checkpointTimes?.['1:1'];

  // The bot uses the first finish-line crossing to open lap 1. For drivers who
  // start after the finish line, that crossing is actually a full first lap and
  // never enters processCompletedLap. Keep this correction local to pit-wall
  // analytics instead of changing race-state semantics globally.
  const shouldInferOpeningLap =
    typeof openingLapTime === 'number'
    && openingLapTime >= 10
    && !recordedLaps.some((lap) => Math.abs(lap - openingLapTime) < 0.001);

  if (!shouldInferOpeningLap) {
    return getPaceStats(playerId);
  }

  return buildPaceStatsFromLaps([openingLapTime, ...recordedLaps]);
}

export class PlayerListService {
  private botService: BotService;
  private positionsInterval: NodeJS.Timeout | null = null;
  private fullStateInterval: NodeJS.Timeout | null = null;
  private isBroadcasting = false;
  private lastWeatherChartDebugKey: string | null = null;

  constructor(botService: BotService) {
    this.botService = botService;
  }

  startBroadcasting() {
    if (this.isBroadcasting) return;

    this.isBroadcasting = true;
    console.log('Starting player position broadcasting (4 times/sec)');
    console.log('Starting full player state broadcasting (1 time/sec)');

    this.positionsInterval = setInterval(() => {
      this.broadcastPlayerPositions();
    }, 1000 / 4);

    this.fullStateInterval = setInterval(() => {
      this.broadcastPlayerList();
    }, 1000);
  }

  stopBroadcasting() {
    if (this.positionsInterval) clearInterval(this.positionsInterval);
    if (this.fullStateInterval) clearInterval(this.fullStateInterval);

    this.positionsInterval = null;
    this.fullStateInterval = null;
    this.isBroadcasting = false;
    console.log('Stopped player broadcasting');
  }

  private getRoomPlayers(): PlayerObject[] {
    const room = (global as any).room;
    return room?.getPlayerList?.() ?? [];
  }

  private toPositionData(player: PlayerObject): PlayerPositionData {
    const livePlayer = player as PlayerObject & {
      velocity?: { x?: number; y?: number };
      avatar?: string;
      country?: string;
    };

    return {
      id: player.id || 0,
      name: player.name || 'Unknown',
      team: player.team ?? Teams.SPECTATORS,
      admin: player.admin || false,
      position: {
        x: typeof player.position?.x === 'number'
          ? Math.round(player.position.x * 100) / 100
          : 0,
        y: typeof player.position?.y === 'number'
          ? Math.round(player.position.y * 100) / 100
          : 0,
      },
      velocity: {
        x: typeof livePlayer.velocity?.x === 'number'
          ? Math.round(livePlayer.velocity.x * 100) / 100
          : 0,
        y: typeof livePlayer.velocity?.y === 'number'
          ? Math.round(livePlayer.velocity.y * 100) / 100
          : 0,
      },
      avatar: livePlayer.avatar || undefined,
      country: livePlayer.country || undefined,
      conn: player.conn || '',
      auth: player.auth || '',
    };
  }

  private toPlayerData(
    player: PlayerObject,
    overrides?: Partial<PlayerData>,
  ): PlayerData {
    const state = botPlayerState[player.id];
    const scuderia = getLeagueScuderia(state?.leagueScuderia);

    return {
      ...this.toPositionData(player),
      ip: state?.ip ?? '',
      isInTheRoom: state?.isInTheRoom ?? true,
      leagueScuderia: scuderia?.name ?? null,
      totalTime: state?.totalTime ?? 0,
      currentLap: state?.currentLap ?? 0,
      lapTime: state?.lapTime ?? 0,
      bestTime: formatLapTime(state?.bestTime),
      bestSectorTimes: [
        formatLapTime(state?.bestSectorTimes?.[0]),
        formatLapTime(state?.bestSectorTimes?.[1]),
        formatLapTime(state?.bestSectorTimes?.[2]),
      ] as [string | null, string | null, string | null],
      tires: state?.tires ?? Tires.SOFT,
      wear: state?.wear ?? 0,
      lapsOnCurrentTire: state?.lapsOnCurrentTire ?? 0,
      inPitLane: state?.inPitlane ?? false,
      inPitStop: state?.inPitStop ?? false,
      pitCount: state?.pits?.pitsNumber ?? 0,
      drs: state?.drs ?? false,
      kers: state?.kers ?? 100,
      gas: state?.gas ?? 100,
      isManagingTires: state?.isManagingTyres ?? false,
      tireBlowWarning: state?.tireBlowWarning ?? false,
      isTyreBlowed: state?.isTyreBlowed ?? false,
      carDamage: state?.carDamage ?? 0,
      racePosition: state?.position ?? null,
      currentSector: state?.currentSector ?? 0,
      checkpointTimes: state?.checkpointTimes ?? {},
      paceStats: getPitWallPaceStats(player.id),
      gapToLeader: state?.gapToLeader ?? '',
      gapToNext: state?.gapToNext ?? '',
      shortName: state?.shortName ?? player.name ?? 'N/A',
      driverNumber: state?.driverNumber ?? 0,
      isLogged: state?.isLogged ?? false,
      isFirstDriver: state?.isFirstDriver ?? false,
      scuderiaColor: scuderia?.color ?? null,
      isOut: false,
      ...overrides,
    };
  }

  private toOfflinePlayerData(
    id: number,
    name: string,
    overrides?: Partial<PlayerData>,
  ): PlayerData {
    const state = botPlayerState[id];
    const scuderia = getLeagueScuderia(state?.leagueScuderia);

    return {
      id,
      name,
      team: Teams.OUTSIDE,
      admin: false,
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      conn: '',
      auth: '',
      ip: state?.ip ?? '',
      isInTheRoom: false,
      leagueScuderia: scuderia?.name ?? null,
      totalTime: state?.totalTime ?? 0,
      currentLap: state?.currentLap ?? 0,
      lapTime: state?.lapTime ?? 0,
      bestTime: formatLapTime(state?.bestTime),
      bestSectorTimes: [
        formatLapTime(state?.bestSectorTimes?.[0]),
        formatLapTime(state?.bestSectorTimes?.[1]),
        formatLapTime(state?.bestSectorTimes?.[2]),
      ] as [string | null, string | null, string | null],
      tires: state?.tires ?? Tires.SOFT,
      wear: state?.wear ?? 0,
      lapsOnCurrentTire: state?.lapsOnCurrentTire ?? 0,
      inPitLane: false,
      inPitStop: false,
      pitCount: state?.pits?.pitsNumber ?? 0,
      drs: false,
      kers: state?.kers ?? 100,
      gas: state?.gas ?? 100,
      isManagingTires: false,
      tireBlowWarning: state?.tireBlowWarning ?? false,
      isTyreBlowed: state?.isTyreBlowed ?? false,
      carDamage: state?.carDamage ?? 0,
      racePosition: state?.position ?? null,
      currentSector: state?.currentSector ?? 0,
      checkpointTimes: state?.checkpointTimes ?? {},
      paceStats: getPitWallPaceStats(id),
      gapToLeader: state?.gapToLeader ?? '',
      gapToNext: state?.gapToNext ?? '',
      shortName: state?.shortName ?? name,
      driverNumber: state?.driverNumber ?? 0,
      isLogged: state?.isLogged ?? false,
      isFirstDriver: state?.isFirstDriver ?? false,
      scuderiaColor: scuderia?.color ?? null,
      isOut: false,
      ...overrides,
    };
  }

  private getStandings(roomPlayers: PlayerObject[]): PlayerData[] {
    const liveByName = new Map(
      roomPlayers.map((player) => [player.name.toLowerCase(), player]),
    );

    if (
      gameMode === GameMode.QUALY
      || gameMode === GameMode.HARD_QUALY
      || gameMode === GameMode.TRAINING
    ) {
      const timedStandings = getPlayersOrderedByQualiTime().map((entry, index) => {
        const live = liveByName.get(entry.name.toLowerCase());
        const overrides = {
          racePosition: entry.time === Number.MAX_VALUE ? null : index + 1,
          bestTime: formatLapTime(entry.time),
          isOut: false,
        };

        return live
          ? this.toPlayerData(live, overrides)
          : this.toOfflinePlayerData(entry.id, entry.name, overrides);
      });
      const timedNames = new Set(timedStandings.map((player) => player.name.toLowerCase()));
      const untimedLivePlayers = roomPlayers
        .filter((player) => !timedNames.has(player.name.toLowerCase()))
        .map((player) => this.toPlayerData(player, { racePosition: null, isOut: false }));

      return [...timedStandings, ...untimedLivePlayers];
    }

    return positionList.map((entry, index) => {
      const live = liveByName.get(entry.name.toLowerCase());
      const isOut = !live || live.team !== Teams.RUNNERS || !entry.active;
      const overrides = {
        racePosition: index + 1,
        isOut,
      };

      return live
        ? this.toPlayerData(live, overrides)
        : this.toOfflinePlayerData(entry.id, entry.name, overrides);
    });
  }

  private async broadcastPlayerPositions() {
    try {
      const players = this.getRoomPlayers()
        .filter((player) => player && typeof player === 'object')
        .map((player) => this.toPositionData(player));

      this.botService.broadcastToClients('playerPositions:update', {
        timestamp: Date.now(),
        players,
        playerCount: players.length,
      } satisfies PlayerPositionsUpdate);
    } catch (error) {
      console.error('Error broadcasting player positions:', error);
    }
  }

  private async broadcastPlayerList() {
    try {
      const roomPlayers = this.getRoomPlayers()
        .filter((player) => player && typeof player === 'object');
      const players = roomPlayers
        .map((player) => this.toPlayerData(player));
      const standings = this.getStandings(roomPlayers);
      const raceSession = getRaceSessionData();
      const weatherChartDebugKey = [
        raceSession.weather.chart?.weatherId ?? 'none',
        raceSession.weather.chart?.duration ?? 0,
        raceSession.weather.chart?.points.length ?? 0,
      ].join('|');

      if (weatherChartDebugKey !== this.lastWeatherChartDebugKey) {
        this.lastWeatherChartDebugKey = weatherChartDebugKey;
        console.log('[PitWall][WeatherChartPayload]', {
          weatherId: raceSession.weather.chart?.weatherId ?? null,
          duration: raceSession.weather.chart?.duration ?? null,
          points: raceSession.weather.chart?.points.length ?? 0,
          currentTimePassed: raceSession.currentTimePassed,
        });
      }

      this.botService.broadcastToClients('playerList:update', {
        timestamp: Date.now(),
        players,
        standings,
        playerCount: players.length,
        raceSession,
      } satisfies PlayerListUpdate);
    } catch (error) {
      console.error('Error broadcasting full player list:', error);
    }
  }
}
