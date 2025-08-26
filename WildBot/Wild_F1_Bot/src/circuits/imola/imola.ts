import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";
import imola_json from "./imola.json";

const IMOLA_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -150,
      maxX: -120,
      minY: 407,
      maxY: 760,
    },
    passingDirection: Direction.RIGHT,
  },
  name: "Autodromo Imola - By Ximb",
  sectorOne: {
    bounds: {
      minX: -150,
      maxX: -120,
      minY: 407,
      maxY: 760,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorTwo: {
    bounds: {
      minX: 2161,
      maxX: 2813,
      minY: -1767,
      maxY: -1797,
    },
    passingDirection: Direction.UP,
  },
  sectorThree: {
    bounds: {
      minX: -166,
      maxX: -136,
      minY: -455,
      maxY: -147,
    },
    passingDirection: Direction.LEFT,
  },
  boxLine: {
    minX: -1150,
    maxX: -150,
    minY: 667,
    maxY: 760,
  },
  pitlaneStart: {
    minX: -1248,
    maxX: -1218,
    minY: 601,
    maxY: 760,
  },
  pitlaneEnd: {
    minX: 330,
    maxX: 360,
    minY: 650,
    maxY: 760,
  },
  drsStart: [
    {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
    },
  ],
  drsEnd: [
    {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
    },
  ],
  checkpoints: [],
  lastPlace: {
    x: imola_json.redSpawnPoints[imola_json.redSpawnPoints.length - 1][0],
    y: imola_json.redSpawnPoints[imola_json.redSpawnPoints.length - 1][1],
  },
  BestTime: bestTimes.imola,
  MainColor: [0x009246, 0xffffff, 0xce2b37],
  AvatarColor: 0x000001,
  Angle: 0,
  Limit: 5,
  Votes: 0,
};

export const IMOLA: Circuit = {
  map: JSON.stringify(imola_json),
  info: IMOLA_INFO,
};
