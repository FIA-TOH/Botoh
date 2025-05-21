import { Tires } from "./tires";
import { Language } from "./language";

export interface PitsInfo {
  pitsNumber: number;
  pit: {
    tyre: string;
    lap: number;
  }[];
  pitsAttemp: number;
}

export interface PlayerInfo {
  totalTime: number;
  drs: boolean;
  ip: string;
  currentLap: number;
  lapChanged: boolean;
  lapTime: number;
  lastLapTimeUpdate: number;
  speedEnabled: boolean;
  isInTheRoom: boolean;
  inPitlane: boolean;
  boxAlert: boolean | number;
  tires: Tires;
  wear: number;
  lapsOnCurrentTire: number;
  showTires: boolean;
  pits: PitsInfo;
  language: Language;
  bestTime: number;
  gripCounter: number;
  maxSpeed: number;
  lastCheckTime: number;
  alertSent: { [key: number]: boolean };
  slipstreamEndTime: number | undefined;
  kers: number;
  gas: number;
  prevGas: number;
  penaltyCounter: number;
  afk: boolean;
  everyoneLaps: boolean;
  voted: boolean;
  currentSector: number;
  sectorChanged: boolean;
  sectorTime: number[];
  sectorTimeCounter: number;
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
