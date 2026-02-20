import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

const istanbul_raw = readFileSync(join(__dirname, "istanbul.hbs"), "utf-8");
const istanbul_json = JSON.parse(istanbul_raw);

const ISTANBUL_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -440,
      maxX: -408,
      minY: 1197,
      maxY: 1568,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorOne: {
    bounds: {
      minX: -440,
      maxX: -408,
      minY: 1197,
      maxY: 1568,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorTwo: {
    bounds: {
      minX: 1453,
      maxX: 1485,
      minY: -732,
      maxY: -451,
    },
    passingDirection: Direction.LEFT,
  },
  sectorThree: {
    bounds: {
      minX: -226,
      maxX: 145,
      minY: 139,
      maxY: 171,
    },
    passingDirection: Direction.DOWN,
  },
  name: "İstanbul Park - By Ximb",
  boxLine: {
    minX: -1442,
    maxX: -440,
    minY: 1197,
    maxY: 1298,
  },
  pitlaneStart: {
    minX: -1675,
    maxX: -1643,
    minY: 1279,
    maxY: 1364,
  },
  pitlaneEnd: {
    minX: -138,
    maxX: -106,
    minY: 1284,
    maxY: 1364,
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
    x: istanbul_json.redSpawnPoints[istanbul_json.redSpawnPoints.length - 1][0],
    y: istanbul_json.redSpawnPoints[istanbul_json.redSpawnPoints.length - 1][1],
  },
  BestTime: bestTimes.istanbul,
  MainColor: [0xe30a17],
  AvatarColor: 0xfff0f0,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  TireDegradationPercentage: 20,
  CutDetectSegments: [
    {
      v0: [-105, 1367],
      v1: [6, 1360],
      index: 170,
      penalty: 5,
    },
    {
      v0: [1689, 648],
      v1: [523, -159],
      index: 171,
      penalty: 5,
    },
    {
      v0: [1941, 442],
      v1: [2260, 969],
      index: 172,
      penalty: 5,
    },
    {
      v0: [1650, -695],
      v1: [2106, -341],
      index: 173,
      penalty: 5,
    },
    {
      v0: [2317, -824],
      v1: [2566, -897],
      index: 174,
      penalty: 5,
    },
    {
      v0: [2586, -1422],
      v1: [2664, -1148],
      index: 175,
      penalty: 5,
    },
    {
      v0: [478, -1112],
      v1: [555, -1121],
      index: 176,
      penalty: 5,
    },
    {
      v0: [376, -833],
      v1: [111, -818],
      index: 177,
      penalty: 5,
    },
    {
      v0: [-800, 535],
      v1: [-1371, 677],
      index: 178,
      penalty: 5,
    },
    {
      v0: [-2223, 916],
      v1: [-1765, 841],
      index: 179,
      penalty: 5,
    },
    {
      v0: [-1978, 1055],
      v1: [-2290, 1529],
      index: 180,
      penalty: 5,
    },
    {
      v0: [-1872, 1351],
      v1: [-1818, 1364],
      index: 181,
      penalty: 5,
    },
  ],
};

export const ISTANBUL: Circuit = {
  map: istanbul_raw,
  info: ISTANBUL_INFO,
};
