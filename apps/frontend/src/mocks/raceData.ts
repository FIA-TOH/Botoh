import { Teams, Tires } from '@/types/game';

export type SessionType =
  | 'race'
  | 'qualy'
  | 'training'
  | 'indy'
  | 'waiting'
  | 'hard_qualy'
  | 'battle_royale';

export type FlagType =
  | 'GREEN'
  | 'YELLOW'
  | 'RED'
  | 'BLUE'
  | 'BLACK'
  | 'SAFETY'
  | 'VIRTUAL_SAFETY';

export interface Driver {
  id: number;
  name: string;
  team: Teams;
  auth?: string;
  ip: string;
  isInTheRoom: boolean;
  leagueScuderiaId?: string | null;
  leagueScuderia: string | null;
  totalTime: number;
  currentLap: number;
  lapTime: number;
  bestTime: string | null;
  bestSectorTimes: [string | null, string | null, string | null];
  currentLapSectorStatus: [
    'none' | 'yellow' | 'green' | 'purple',
    'none' | 'yellow' | 'green' | 'purple',
    'none' | 'yellow' | 'green' | 'purple',
  ];
  tires: Tires;
  nextPitTires: Tires | null;
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
  position: number | null;
  currentSector: number;
  checkpointTimes: Record<string, number>;
  paceStats: PaceStats;
  gapToLeader: string;
  gapToNext: string;
  shortName: string;
  driverNumber: number;
  isFirstDriver?: boolean;
  scuderiaColor?: number | null;
  isOut?: boolean;
  isFinished?: boolean;
}

export interface RaceSession {
  sessionType: SessionType;
  currentTimePassed: number;
  totalTime: number | null;
  currentLap: number;
  totalLaps: number;
  flag: FlagType;
  isChatMuted: boolean;
  pitGap: {
    value: number;
    isEstimated: boolean;
  };
  weather: WeatherSession;
}

export interface WeatherSnapshot {
  rain: number;
  wet: number;
}

export interface WeatherAnnouncement {
  id: string;
  message: {
    en: string;
    es: string;
    fr: string;
    tr: string;
    pt: string;
  };
  announcedAtGameTime: number;
  announcedAtTimestamp: number;
}

export interface WeatherChartPoint {
  time: number;
  rain: number;
}

export interface WeatherChartData {
  weatherId: string;
  duration: number;
  interval: number;
  points: WeatherChartPoint[];
}

export interface WeatherSession {
  global: WeatherSnapshot;
  sectors: {
    sector1: WeatherSnapshot;
    sector2: WeatherSnapshot;
    sector3: WeatherSnapshot;
  };
  lastAnnouncement: WeatherAnnouncement | null;
  chart?: WeatherChartData | null;
}

export interface PaceStats {
  fastestLap: number | null;
  lastFiveAverage: number | null;
  lastLap: number | null;
  lastLapComparedToAverage: number | null;
  completedLaps: number;
}
