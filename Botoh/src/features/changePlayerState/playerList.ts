import { COLORS } from "../chat/chat";
import { Language } from "../chat/language";
import { PitStep } from "../tires&pits/pitMessaging";
import { PitResult } from "../tires&pits/pitStopFunctions";

import { Tires } from "../tires&pits/tires";
import { LeagueScuderiaId } from "../scuderias/scuderias";

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

export interface NewPitState {
  isWaitingForPit: boolean;
  pitStartTime?: number;
  pKeyPressed: boolean;
  isPitNewEnabled: boolean;
  selectedTires?: Tires;
  pitReadyTime?: number;
  pitEmojiShowTime?: number;
  reactionTime?: number;
  emojiDelayTime?: number;
  reactionTimeout?: number;
}

export interface RepairState {
  isWaitingForRepair: boolean;
  isRepairing: boolean;
  repairStartTime?: number;
  repairInitialPos?: { x: number; y: number };
  repairReadyTime?: number;
  repairEmojiShowTime?: number;
  reactionTime?: number;
  repairEndTime?: number;
  damageToRepair?: number;
}

export interface XKeyState {
  isPressed: boolean;
  pressTimes: number[];
  releaseTimes: number[];
  lastCheckTime: number;
}

export interface PlayerInfo {
  ip: string;
  isInTheRoom: boolean;
  afk: boolean;
  afkAlert: boolean;
  leagueScuderia: LeagueScuderiaId | null;
  didHardQualy: boolean;

  sandbagPenalty: number;

  totalTime: number;
  currentLap: number;
  lapChanged: boolean;
  lapTime: number;
  lastLapTimeUpdate: number;
  bestTime: number;
  lapsBehindLeaderWhenLeft: number | null;

  currentSector: number;
  checkpointTimes: Record<string, number>;
  sectorChanged: boolean;
  sectorTime: number[];
  sectorTimeCounter: number;
  bestSectorTimes: [number, number, number];
  sectorColour: COLORS;

  tires: Tires;
  wear: number;
  lapsOnCurrentTire: number;
  showTires: boolean;
  maxSpeed: number;
  gripCounter: number;

  inPitlane: boolean;
  inPitStop: boolean;
  boxAlert: boolean | number;
  pits: PitsInfo;
  pitCountdown?: number;
  pitTargetTires?: Tires;
  nextPitTires: Tires | null;
  pitInitialPos?: { x: number; y: number };
  pitFailures?: PitResult;
  pitSteps?: PitStep[] | undefined;
  canLeavePitLane: boolean;
  blowAtWear: number;
  warningAtWear?: number | null;
  warningIsFalse?: boolean;
  tireBlowWarning?: boolean;

  speedEnabled: boolean;
  drs: boolean;
  kers: number;
  gas: number;
  prevGas: number;
  slipstreamEndTime: number | undefined;
  finalSlipstream: number;

  penaltyCounter: number;
  alertSent: { [key: number]: boolean };
  lastCheckTime: number;

  language: Language;
  everyoneLaps: boolean;
  voted: boolean;

  cameraFollowing: boolean;

  cutPenaltyEndTime?: number;
  cutPenaltyMultiplier?: number;
  cuttedTrackOnThisLap?: boolean;
  lastLapValid?: boolean;

  lastDir?: Direction;
  curveResistanceTicks?: number;
  slipTicks?: number;
  slipDir?: Direction;
  directionChangerEndTime?: number;
  directionChangerX?: number;
  directionChangerY?: number;
  directionChangerForce?: number;

  currentDirection?: string;
  currentDirectionEmoji?: string;

  previousPos: { x: number | null; y: number | null };

  timeWhenEntered: number;

  canRejoin: boolean;

  newPitState?: NewPitState;
  repairState?: RepairState;
  
  xKeyState?: XKeyState;
  
  isManagingTyres: boolean;
  
  isTyreBlowed: boolean;
  
  blowoutTickCounter: number;
  blowoutRisk: number;
  blowoutRiskLimit: number;
  blowoutWarningRiskRatio: number;
  lastBlowoutRiskTime: number;
  
  pubAvatar: string;

  driverNumber: number;
  isFirstDriver: boolean;
  driverCategory: "starter" | "reserve" | null;
  loggedUsername: string | null;
  boxCoordinates: { x: number; y: number } | null;
  boxCoordinatesByCircuit: Record<string, { x: number; y: number }>;

  carDamage: number;

  position: number | null;

  gapToLeader: string | null;
  gapToNext: string | null;
  shortName: string;

  isLogged: boolean;
}

type PlayerList = {
  [auth: string]: PlayerInfo;
};

let actualPlayerList: PlayerList = {};
const preparedPitTiresByPlayerId: { [id: number]: Tires | null } = {};

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

export function clearAllPreparedPitTires() {
  Object.keys(preparedPitTiresByPlayerId).forEach((id) => {
    delete preparedPitTiresByPlayerId[Number(id)];
  });

  Object.values(actualPlayerList).forEach((player) => {
    player.nextPitTires = null;
  });
}

export function setPreparedPitTire(playerId: number, tire: Tires | null) {
  preparedPitTiresByPlayerId[playerId] = tire;

  const player = playerList[playerId];
  if (player) {
    player.nextPitTires = tire;
  }
}

export function getPreparedPitTire(playerId: number): Tires | null {
  return playerList[playerId]?.nextPitTires ?? preparedPitTiresByPlayerId[playerId] ?? null;
}

export function clearPreparedPitTire(playerId: number) {
  delete preparedPitTiresByPlayerId[playerId];

  const player = playerList[playerId];
  if (player) {
    player.nextPitTires = null;
  }
}

export function updatePlayerListPosition(
  playerId: number,
  position: number | null,
) {
  const player = playerList[playerId];
  if (!player || player.position === position) return;

  player.position = position;
}

export function updatePlayerListRaceGaps(
  playerId: number,
  gapToLeader: string | null,
  gapToNext: string | null,
) {
  const player = playerList[playerId];
  if (!player) return;

  if (player.gapToLeader !== gapToLeader) {
    player.gapToLeader = gapToLeader;
  }

  if (player.gapToNext !== gapToNext) {
    player.gapToNext = gapToNext;
  }
}
