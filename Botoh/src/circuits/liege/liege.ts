import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, CircuitPhysics, Direction } from "../Circuit";
import { readFileSync } from "fs";
import { join } from "path";

const liege_raw = readFileSync(join(__dirname, "liege.hbs"), "utf-8");
const liege_json = JSON.parse(liege_raw);

const LIEGE_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 392,
      maxX: 424,
      minY: 1088,
      maxY: 1386,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorOne: {
    bounds: {
      minX: 392,
      maxX: 424,
      minY: 1088,
      maxY: 1386,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorTwo: {
    bounds: {
      minX: 713,
      maxX: 936,
      minY: -123,
      maxY: -91,
    },
    passingDirection: Direction.UP,
  },
  sectorThree: {
    bounds: {
      minX: -325,
      maxX: -293,
      minY: -969,
      maxY: -786,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Liege by aitor (Belgium)",
  boxLine: {
    minX: -344,
    maxX: -344,
    minY: 1218,
    maxY: 1218,
  },
  pitlaneStart: {
    minX: -458,
    maxX: -426,
    minY: 1266,
    maxY: 1404,
  },
  pitlaneEnd: {
    minX: 284,
    maxX: 316,
    minY: 1273,
    maxY: 1403,
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
    x: liege_json.redSpawnPoints[liege_json.redSpawnPoints.length - 1][0],
    y: liege_json.redSpawnPoints[liege_json.redSpawnPoints.length - 1][1],
  },
  BestTime: bestTimes.liege,
  MainColor: [0x87ceeb],
  AvatarColor: 0xc41e3a,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  pitSpeed: 1,
  physicsType: CircuitPhysics.CLASSIC,
};

export const LIEGE: Circuit = {
  map: liege_raw,
  info: LIEGE_INFO,
};
