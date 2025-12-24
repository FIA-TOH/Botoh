import { DEFAULT_LANGUAGE } from "../chat/language";
import { playerList } from "../changePlayerState/playerList";
import { handleAvatar, Situacions } from "./handleAvatar";
import { Tires, TIRE_STARTING_SPEED } from "../tires&pits/tires";
import { gameMode, GameMode } from "../changeGameState/changeGameModes";
import { start } from "repl";

export function createPlayerInfo(ip?: string) {
  return {
    // Identificação e status de presença
    ip: ip || "Not Available",
    isInTheRoom: true,
    afk: false,
    afkAlert: false,
    leagueScuderia: null,
    didHardQualy: false,

    // Propriedades de corrida e volta
    totalTime: 0,
    currentLap: 0,
    lapChanged: false,
    lapTime: 0,
    lastLapTimeUpdate: 0,
    bestTime: Number.MAX_VALUE,
    lapsBehindLeaderWhenLeft: null,

    // Setores
    currentSector: 3,
    sectorChanged: false,
    sectorTime: [],
    sectorTimeCounter: 0,

    // Pneus
    tires: Tires.SOFT,
    wear: 0,
    lapsOnCurrentTire: -1,
    showTires: true,
    maxSpeed: TIRE_STARTING_SPEED[Tires.SOFT],
    gripCounter: 0,

    // Pit stop
    inPitlane: false,
    inPitStop: false,
    boxAlert: false,
    pits: {
      pitsNumber: 0,
      pit: [
        {
          tyre: Tires.SOFT,
          lap: 0,
          time: 0,
        },
      ],
    },
    pitCountdown: 0,
    pitTargetTires: Tires.SOFT,
    pitInitialPos: { x: 0, y: 0 },
    pitFailures: undefined,
    pitSteps: undefined,
    canLeavePitLane: true,
    blowAtWear: 100,
    warningAtWear: null,
    warningIsFalse: false,
    warningShown: false,

    // Recursos de corrida
    speedEnabled: false,
    drs: false,
    kers: 100,
    gas: 100,
    prevGas: 100,
    slipstreamEndTime: undefined,
    finalSlipstream: 0,

    // Penalidades e alertas
    penaltyCounter: 0,
    alertSent: {},
    lastCheckTime: 0,
    cuttedTrackOnThisLap: false,
    lastLapValid: true,

    // Preferências e estado geral
    language: DEFAULT_LANGUAGE,
    everyoneLaps: false,
    voted: false,

    cameraFollowing: false,

    cutPenaltyEndTime: undefined,
    cutPenaltyMultiplier: 1,

    lastDir: undefined,
    slipTicks: undefined,
    slipDir: undefined,

    previousPos: { x: null, y: null },

    //contadores
    timeWhenEntered: 0,
  };
}

export function resetPlayers(room: RoomObject) {
  room.getPlayerList().forEach((p) => {
    resetPlayer(p, room, p.id);
  });
}

export function resetPlayer(
  player: PlayerObject,
  room: RoomObject,
  id: number,
  startingRace?: boolean
) {
  if (playerList[id] === undefined) {
    playerList[id] = createPlayerInfo();
  }
  if (startingRace) {
    playerList[id].bestTime = Number.MAX_VALUE;
  }
  if (gameMode !== GameMode.TRAINING) {
    playerList[id].tires = Tires.SOFT;
  }
  playerList[id].isInTheRoom = true;
  playerList[id].afkAlert = false;
  playerList[id].didHardQualy = false;

  playerList[id].totalTime = 0;
  playerList[id].currentLap = 0;
  playerList[id].lapChanged = false;
  playerList[id].lapTime = 0;
  playerList[id].lastLapTimeUpdate = 0;
  playerList[id].lapsBehindLeaderWhenLeft = null;

  playerList[id].currentSector = 3;
  playerList[id].sectorChanged = false;
  playerList[id].sectorTime = [];
  playerList[id].sectorTimeCounter = 0;

  playerList[id].lapsOnCurrentTire = -1;
  playerList[id].wear = 0;
  playerList[id].maxSpeed = TIRE_STARTING_SPEED[Tires.SOFT];
  playerList[id].gripCounter = 0;

  playerList[id].inPitlane = false;
  playerList[id].inPitStop = false;
  playerList[id].boxAlert = false;
  playerList[id].pitFailures = undefined;
  playerList[id].pitSteps = undefined;
  playerList[id].canLeavePitLane = true;

  playerList[id].pits = {
    pitsNumber: 0,
    pit: [
      {
        tyre: Tires.SOFT,
        lap: 0,
        time: 0,
      },
    ],
  };
  (playerList[id].pitCountdown = 0),
    (playerList[id].pitTargetTires = Tires.SOFT),
    (playerList[id].pitInitialPos = { x: 0, y: 0 }),
    (playerList[id].drs = false);
  playerList[id].kers = 100;
  playerList[id].gas = 100;
  playerList[id].prevGas = 100;
  playerList[id].slipstreamEndTime = undefined;
  playerList[id].finalSlipstream = 0;
  playerList[id].blowAtWear = 100;
  playerList[id].warningAtWear = null;
  playerList[id].warningIsFalse = false;
  playerList[id].warningShown = false;

  playerList[id].penaltyCounter = 0;
  playerList[id].lastCheckTime = 0;
  playerList[id].alertSent = {};

  playerList[id].voted = false;

  playerList[id].cameraFollowing = false;

  playerList[id].cutPenaltyEndTime = undefined;
  playerList[id].cutPenaltyMultiplier = 1;
  playerList[id].cuttedTrackOnThisLap = false;
  playerList[id].lastLapValid = true;
  handleAvatar(Situacions.ChangeTyre, player, room);

  playerList[id].lastDir = undefined;
  playerList[id].slipTicks = undefined;
  playerList[id].slipDir = undefined;

  playerList[id].previousPos = { x: null, y: null };

  //contadores
  playerList[id].timeWhenEntered = 0;
}
