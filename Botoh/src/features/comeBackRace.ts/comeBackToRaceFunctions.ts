import { Tires } from "../tires&pits/tires";

export const REJOIN_TIME_LIMIT = 60; //seconds

export let playersLeftInfo: PlayerLeftInfo[] = [];

export interface PlayerLeftInfo {
  id: number;
  name: string;
  ip: string;
  leagueTeam: string | null;
  didHardQualy: boolean;
  totalTime: number;
  bestTime: number;
  tires: Tires;
  wear: number;
  lapsOnCurrentTire: number;
  showTires: boolean;
  maxSpeed: number;
  pits: any;
  pitTargetTires: any;
  pitFailures: any;
  pitInitialPos: any;
  speedEnabled: boolean;
  kers: number;
  gas: number;
  prevGas: number;
  language: string;
  everyoneLaps: any;
  voted: boolean;
  leftAt: string;
}

export function addPlayerLeftInfo(player: PlayerLeftInfo) {
  playersLeftInfo.push(player);
}

export function clearPlayersLeftInfo() {
  playersLeftInfo = [];
}
