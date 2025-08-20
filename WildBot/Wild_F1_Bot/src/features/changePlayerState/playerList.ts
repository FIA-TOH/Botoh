import { Language } from "../chat/language";
import { LeagueTeam } from "../teams/teams";
import { Tires } from "../tires&pits/tires";

export interface PitsInfo {
  pitsNumber: number;
  pit: {
    tyre: string;
    lap: number;
  }[];
  pitsAttemp: number;
}
export interface PlayerInfo {
  // Identificação e status de presença
  ip: string;
  isInTheRoom: boolean;
  afk: boolean;
  afkAlert: boolean;
  leagueTeam: string | null;

  // Propriedades de corrida e volta
  totalTime: number;
  currentLap: number;
  lapChanged: boolean;
  lapTime: number;
  lastLapTimeUpdate: number;
  bestTime: number;

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
  boxAlert: boolean | number;
  pits: PitsInfo;

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
