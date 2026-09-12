import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, CircuitPhysics, Direction } from "../Circuit";

const tigre_raw = readFileSync(join(__dirname, "tigre.hbs"), "utf-8");
const tigre_json = JSON.parse(tigre_raw);

const TIGRE_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -41,
      maxX: -9,
      minY: 23,
      maxY: 183,
    },
    passingDirection: Direction.LEFT,
  },
  sectorOne: {
    bounds: {
      minX: -41,
      maxX: -9,
      minY: 23,
      maxY: 183,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: -462,
      maxX: -294,
      minY: -754,
      maxY: -722,
    },
    passingDirection: Direction.UP,
  },
  sectorThree: {
    bounds: {
      minX: 525,
      maxX: 557,
      minY: -153,
      maxY: 11,
    },
    passingDirection: Direction.RIGHT,
  },
  name: "Circuito Nacional El Tigre By Nanoseb",
  boxLine: {
    minX: -1376,
    maxX: -192,
    minY: 295,
    maxY: 416,
  },
  pitlaneStart: {
    minX: 597,
    maxX: 629,
    minY: 289,
    maxY: 590,
  },
  pitlaneEnd: {
    minX: -1500,
    maxX: -1413,
    minY: 150,
    maxY: 182,
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
    x: tigre_json.redSpawnPoints[tigre_json.redSpawnPoints.length - 1][0],
    y: tigre_json.redSpawnPoints[tigre_json.redSpawnPoints.length - 1][1],
  },
  BestTime: bestTimes.tigre,
  MainColor: [0xD0CFD4, 0xFDFDEE3, 0xDFDEE3],
  AvatarColor: 0xD0CFD4,
  Angle: 60,
  Limit: 5,
  Votes: 0,
  physicsType: CircuitPhysics.CLASSIC,
};

export const TIGRE: Circuit = {
  map: tigre_raw,
  info: TIGRE_INFO,
};