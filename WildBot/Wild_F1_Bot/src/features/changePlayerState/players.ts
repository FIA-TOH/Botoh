import { DEFAULT_LANGUAGE } from "../chat/language";
import { playerList } from "../changePlayerState/playerList";
import { handleAvatar } from "./handleAvatar";
import { Tires, TIRE_STARTING_SPEED } from "../tires&pits/tires";
import { gameMode, GameMode } from "../changeGameState/changeGameModes";

export function createPlayerInfo(ip?: string) {
  return {
    // Identificação e status de presença
    ip: ip || "Not Available",
    isInTheRoom: true,
    afk: false,
    afkAlert: false,
    leagueTeam: null,

    // Propriedades de corrida e volta
    totalTime: 0,
    currentLap: 0,
    lapChanged: false,
    lapTime: 0,
    lastLapTimeUpdate: 0,
    bestTime: Number.MAX_VALUE,

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
    boxAlert: false,
    pits: {
      pitsNumber: 0,
      pit: [],
      pitsAttemp: 0,
    },

    // Recursos de corrida
    speedEnabled: false,
    drs: false,
    kers: 100,
    gas: 100,
    prevGas: 100,
    slipstreamEndTime: undefined,

    // Penalidades e alertas
    penaltyCounter: 0,
    alertSent: {},
    lastCheckTime: 0,

    // Preferências e estado geral
    language: DEFAULT_LANGUAGE,
    everyoneLaps: false,
    voted: false,
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

  playerList[id].totalTime = 0;
  playerList[id].currentLap = 0;
  playerList[id].lapChanged = false;
  playerList[id].lapTime = 0;
  playerList[id].lastLapTimeUpdate = 0;

  playerList[id].currentSector = 3;
  playerList[id].sectorChanged = false;
  playerList[id].sectorTime = [];
  playerList[id].sectorTimeCounter = 0;

  playerList[id].lapsOnCurrentTire = -1;
  playerList[id].wear = 0;
  playerList[id].maxSpeed = TIRE_STARTING_SPEED[Tires.SOFT];
  playerList[id].gripCounter = 0;

  playerList[id].inPitlane = false;
  playerList[id].boxAlert = false;
  playerList[id].pits = {
    pitsNumber: 0,
    pit: [],
    pitsAttemp: 0,
  };

  playerList[id].drs = false;
  playerList[id].kers = 100;
  playerList[id].gas = 100;
  playerList[id].prevGas = 100;
  playerList[id].slipstreamEndTime = undefined;

  playerList[id].penaltyCounter = 0;
  playerList[id].lastCheckTime = 0;
  playerList[id].alertSent = {};

  playerList[id].voted = false;
  handleAvatar("ChangeTyre", player, room);
}
