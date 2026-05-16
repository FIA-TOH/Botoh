import { Teams } from "../../../../Botoh/src/features/changeGameState/teams";
import { Tires } from "../../../../Botoh/src/features/tires&pits/tires";

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
  name: string;
  team: Teams;
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
  position: number | null;
  gapToLeader: string;
  gapToNext: string;
  shortName: string;
  driverNumber: number;
  isFirstDriver?: boolean;
  scuderiaColor?: number | null;
  isOut?: boolean;
}

export interface RaceSession {
  sessionType: SessionType;
  currentTimePassed: number;
  totalTime: number | null;
  currentLap: number;
  totalLaps: number;
  flag: FlagType;
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

export interface WeatherSession {
  global: WeatherSnapshot;
  sectors: {
    sector1: WeatherSnapshot;
    sector2: WeatherSnapshot;
    sector3: WeatherSnapshot;
  };
  lastAnnouncement: WeatherAnnouncement | null;
}
