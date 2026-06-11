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

type PreparedPitTireStore = {
  byPlayerId: { [id: number]: Tires | null };
  byPlayerName: { [name: string]: Tires | null };
};

function getPreparedPitTireStore(): PreparedPitTireStore {
  const globalStore = globalThis as typeof globalThis & {
    __ftohPreparedPitTires?: PreparedPitTireStore;
  };

  if (!globalStore.__ftohPreparedPitTires) {
    globalStore.__ftohPreparedPitTires = {
      byPlayerId: {},
      byPlayerName: {},
    };
  }

  return globalStore.__ftohPreparedPitTires;
}

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
  const store = getPreparedPitTireStore();

  Object.keys(store.byPlayerId).forEach((id) => {
    delete store.byPlayerId[Number(id)];
  });
  Object.keys(store.byPlayerName).forEach((name) => {
    delete store.byPlayerName[name];
  });

  Object.values(actualPlayerList).forEach((player) => {
    player.nextPitTires = null;
  });
}

function normalizePreparedPitTireName(playerName?: string | null) {
  return (playerName ?? "").trim().toLowerCase();
}

function debugPreparedPitTire(message: string, data: Record<string, unknown>) {
  console.log("[PitWall][PreparedTyres]", message, data);
}

export function setPreparedPitTire(
  playerId: number,
  tire: Tires | null,
  playerName?: string | null,
) {
  const store = getPreparedPitTireStore();
  store.byPlayerId[playerId] = tire;
  const normalizedName = normalizePreparedPitTireName(playerName);
  if (normalizedName) {
    store.byPlayerName[normalizedName] = tire;
  }

  const player = playerList[playerId];
  if (player) {
    player.nextPitTires = tire;
  }

  debugPreparedPitTire("set", {
    playerId,
    playerName,
    normalizedName,
    tire,
    hasPlayerState: Boolean(player),
    auth: idToAuth[playerId] ?? null,
    storeIds: Object.keys(store.byPlayerId),
    storeNames: Object.keys(store.byPlayerName),
  });
}

export function getPreparedPitTire(
  playerId: number,
  playerName?: string | null,
): Tires | null {
  const store = getPreparedPitTireStore();
  const normalizedName = normalizePreparedPitTireName(playerName);
  const fromState = playerList[playerId]?.nextPitTires ?? null;
  const fromId = store.byPlayerId[playerId] ?? null;
  const fromName = normalizedName ? store.byPlayerName[normalizedName] ?? null : null;
  const result = fromState ?? fromId ?? fromName ?? null;

  debugPreparedPitTire("get", {
    playerId,
    playerName,
    normalizedName,
    result,
    fromState,
    fromId,
    fromName,
    hasPlayerState: Boolean(playerList[playerId]),
    auth: idToAuth[playerId] ?? null,
    storeIds: Object.keys(store.byPlayerId),
    storeNames: Object.keys(store.byPlayerName),
  });

  return result;
}

export function clearPreparedPitTire(playerId: number, playerName?: string | null) {
  const store = getPreparedPitTireStore();
  const normalizedName = normalizePreparedPitTireName(playerName);
  const beforeId = store.byPlayerId[playerId] ?? null;
  const beforeName = normalizedName ? store.byPlayerName[normalizedName] ?? null : null;
  const beforeState = playerList[playerId]?.nextPitTires ?? null;

  delete store.byPlayerId[playerId];
  if (normalizedName) {
    delete store.byPlayerName[normalizedName];
  }

  const player = playerList[playerId];
  if (player) {
    player.nextPitTires = null;
  }

  debugPreparedPitTire("clear", {
    playerId,
    playerName,
    normalizedName,
    beforeId,
    beforeName,
    beforeState,
    hasPlayerState: Boolean(player),
    auth: idToAuth[playerId] ?? null,
    storeIds: Object.keys(store.byPlayerId),
    storeNames: Object.keys(store.byPlayerName),
  });
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
