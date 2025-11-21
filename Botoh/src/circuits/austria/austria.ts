import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

const austria_raw = readFileSync(join(__dirname, "austria.hbs"), "utf-8");
const austria_json = JSON.parse(austria_raw);

const AUSTRIA_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 1,
      maxX: 33,
      minY: 44,
      maxY: 377,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorOne: {
    bounds: {
      minX: 1,
      maxX: 33,
      minY: 44,
      maxY: 377,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorTwo: {
    bounds: {
      minX: 1079,
      maxX: 1111,
      minY: 2830,
      maxY: 3576,
    },
    passingDirection: Direction.LEFT,
  },
  sectorThree: {
    bounds: {
      minX: 201,
      maxX: 443,
      minY: 1377,
      maxY: 1409,
    },
    passingDirection: Direction.UP,
  },
  name: "Redbull Ring by Rodri",
  boxLine: {
    minX: -1000,
    maxX: 1,
    minY: 275,
    maxY: 355,
  },
  pitlaneStart: {
    minX: -1312,
    maxX: -1280,
    minY: 217,
    maxY: 340,
  },
  pitlaneEnd: {
    minX: 31,
    maxX: 63,
    minY: 215,
    maxY: 381,
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
    x: austria_json.redSpawnPoints[austria_json.redSpawnPoints.length - 1][0],
    y: austria_json.redSpawnPoints[austria_json.redSpawnPoints.length - 1][1],
  },
  BestTime: bestTimes.austria,
  MainColor: [0xd6001d, 0xd6001d, 0xffffff],
  AvatarColor: 0xffffff,
  Angle: 60,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
  TireDegradationPercentage: -5,
  CutDetectSegments: [
    {
      v0: [835, 780],
      v1: [546, 688],
      index: 178,
      penalty: 5,
    },
    {
      v0: [177, 2786],
      v1: [429.9235558325382, 2834.088585502436],
      index: 181,
      penalty: 5,
    },
    {
      v0: [486, 415],
      v1: [900, 20],
      index: 182,
      penalty: 5,
    },
    {
      v0: [-2456, 888],
      v1: [-2075, 350],
      index: 183,
      penalty: 5,
    },
    {
      v0: [-742, 1008],
      v1: [-617, 1119],
      index: 184,
      penalty: 5,
    },
  ],
};

export const AUSTRIA: Circuit = {
  map: austria_raw,
  info: AUSTRIA_INFO,
};
