import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";
import monzaPublic_json from "./monzaPublic.json";

const MONZAPUBLIC_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 1313,
      maxX: 1335,
      minY: 243,
      maxY: 668,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Autodromo Nazionale di Monza - By Ximb",
  sectorOne: {
    bounds: {
      minX: 1313,
      maxX: 1335,
      minY: 243,
      maxY: 668,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: -3698,
      maxX: -3433,
      minY: -1873,
      maxY: -1841,
    },
    passingDirection: Direction.UP,
  },
  sectorThree: {
    bounds: {
      minX: -1236,
      maxX: -1204,
      minY: -1505,
      maxY: -960,
    },
    passingDirection: Direction.RIGHT,
  },
  boxLine: {
    minX: 1349,
    maxX: 2379,
    minY: 250,
    maxY: 325,
  },
  pitlaneStart: {
    minX: 3100,
    maxX: 3132,
    minY: 272,
    maxY: 406,
  },
  pitlaneEnd: {
    minX: 1242,
    maxX: 1274,
    minY: 248,
    maxY: 409,
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
    x: monzaPublic_json.redSpawnPoints[
      monzaPublic_json.redSpawnPoints.length - 1
    ][0],
    y: monzaPublic_json.redSpawnPoints[
      monzaPublic_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.monza,
  MainColor: [0x009246, 0xffffff, 0xce2b37],
  AvatarColor: 0x000001,
  Angle: 0,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.96,
};

export const MONZAPUBLIC: Circuit = {
  map: JSON.stringify(monzaPublic_json),
  info: MONZAPUBLIC_INFO,
};
