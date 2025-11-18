import { Language } from "../chat/language";
import { LeagueTeam } from "../teams/teams";
import { PitStep } from "../tires&pits/pitMessaging";
import { PitResult } from "../tires&pits/pitStopFunctions";

import { Tires } from "../tires&pits/tires";

export interface PitsInfo {
  pitsNumber: number;
  pit: {
    tyre: Tires;
    lap: number;
    time: number;
  }[];
}
type Direction = {
  x: number;
  y: number;
};

export interface PlayerInfo {
  // Identificação e status de presença
  ip: string;
  isInTheRoom: boolean;
  afk: boolean;
  afkAlert: boolean;
  leagueTeam: string | null;
  didHardQualy: boolean;

  // Propriedades de corrida e volta
  totalTime: number;
  currentLap: number;
  lapChanged: boolean;
  lapTime: number;
  lastLapTimeUpdate: number;
  bestTime: number;
  lapsBehindLeaderWhenLeft: number | null;

  // Setores
  currentSector: number;
  sectorChanged: boolean;
  sectorTime: number[];
  sectorTimeCounter: number;

  // Pneus
  tires: Tires;
  wear: number;
  lapsOnCurrentTire: number;
  showTires: boolean;
  maxSpeed: number;
  gripCounter: number;

  // Pit stop
  inPitlane: boolean;
  inPitStop: boolean;
  boxAlert: boolean | number;
  pits: PitsInfo;
  pitCountdown?: number;
  pitTargetTires?: Tires;
  pitInitialPos?: { x: number; y: number };
  pitFailures?: PitResult;
  pitSteps?: PitStep[] | undefined;
  canLeavePitLane: boolean;
  blowAtWear: number;
  warningAtWear?: number | null;
  warningIsFalse?: boolean;
  warningShown?: boolean;

  // Recursos de corrida
  speedEnabled: boolean;
  drs: boolean;
  kers: number;
  gas: number;
  prevGas: number;
  slipstreamEndTime: number | undefined;

  // Penalidades e alertas
  penaltyCounter: number;
  alertSent: { [key: number]: boolean };
  lastCheckTime: number;

  // Preferências e estado geral
  language: Language;
  everyoneLaps: boolean;
  voted: boolean;

  cameraFollowing: boolean;

  cutPenaltyEndTime?: number;
  cutPenaltyMultiplier?: number;
  cuttedTrackOnThisLap?: boolean;

  lastDir?: Direction;
  slipTicks?: number;
  slipDir?: Direction;

  previousPos: { x: number | null; y: number | null };

  //contadores
  timeWhenEntered: number;
}

type PlayerList = {
  [auth: string]: PlayerInfo;
};

let actualPlayerList: PlayerList = {};

export let idToAuth: { [id: number]: string } = {};

export const playerList = new Proxy(actualPlayerList, {
  get(target, prop) {
    return target[idToAuth[Number(prop)]];
  },

  set(target, prop, newValue: PlayerInfo): boolean {
    target[idToAuth[Number(prop)]] = newValue;
    return true;
  },
});
