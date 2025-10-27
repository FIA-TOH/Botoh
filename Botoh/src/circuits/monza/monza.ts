import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

const monza_raw = readFileSync(join(__dirname, "monza.hbs"), "utf-8");
const monza_json = JSON.parse(monza_raw);

const MONZA_INFO: CircuitInfo = {
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
    x: monza_json.redSpawnPoints[monza_json.redSpawnPoints.length - 1][0],
    y: monza_json.redSpawnPoints[monza_json.redSpawnPoints.length - 1][1],
  },
  BestTime: bestTimes.monza,
  MainColor: [0x009246, 0xffffff, 0xce2b37],
  AvatarColor: 0x000001,
  Angle: 0,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
  TireDegradationPercentage: -30,
  CutDetectSegments: [
    {
      v0: [-936, 390],
      v1: [-768, 390],
      index: 154,
      penalty: 5,
    },
    {
      v0: [-3698.54992128, -1873.3869081599998],
      v1: [-3747, -2109],
      index: 155,
      penalty: 5,
    },
    {
      v0: [-4100, -2229],
      v1: [-3615, -2688],
      index: 156,
      penalty: 5,
    },
    {
      v0: [-884, -1090],
      v1: [-1009.7845420775873, -1328.6006022880429],
      index: 157,
      penalty: 5,
    },
    {
      v0: [-493.3007359999999, -455.6381440000001],
      v1: [-338, -998],
      index: 158,
      penalty: 5,
    },
    {
      v0: [167, -821],
      v1: [111, -753],
      index: 159,
      penalty: 5,
    },
    {
      v0: [-1321, 586],
      v1: [-1321, 669],
      index: 160,
      penalty: 5,
    },
    {
      v0: [-1053, 194],
      v1: [-1303, 480],
      index: 161,
      penalty: 5,
    },
    {
      v0: [-403, 622],
      v1: [-407, 667],
      index: 162,
      penalty: 5,
    },
    {
      v0: [1314, 622],
      v1: [1307, 667],
      index: 163,
      penalty: 5,
    },
    {
      v0: [2375, 623],
      v1: [2367, 667],
      index: 164,
      penalty: 5,
    },
    {
      v0: [3725.2760268778657, 598.25551848653],
      v1: [3723, 670],
      index: 165,
      penalty: 5,
    },
    {
      v0: [-4378, -4695],
      v1: [-4127, -4073],
      index: 166,
      penalty: 5,
    },
  ],
};

export const MONZA: Circuit = {
  map: monza_raw,
  info: MONZA_INFO,
};
