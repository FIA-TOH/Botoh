import { bestTimes } from "../bestTimes";

import { readFileSync } from "fs";
import { join } from "path";

import { Circuit, CircuitInfo, Direction } from "../Circuit";

const hungary_raw = readFileSync(join(__dirname, "hungary.hbs"), "utf-8");
const hungary_json = JSON.parse(hungary_raw);

const HUNGARY_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -208,
      maxX: -176,
      minY: 1912,
      maxY: 2328,
    },
    passingDirection: Direction.LEFT,
  },
  sectorOne: {
    bounds: {
      minX: -208,
      maxX: -176,
      minY: 1912,
      maxY: 2328,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: -1264,
      maxX: -807,
      minY: -262,
      maxY: -232,
    },
    passingDirection: Direction.UP,
  },
  sectorThree: {
    bounds: {
      minX: 1481,
      maxX: 2020,
      minY: 506,
      maxY: 538,
    },
    passingDirection: Direction.DOWN,
  },
  name: "Hungaroring - By Ximb",
  boxLine: {
    minX: -176,
    maxX: 824,
    minY: 1912,
    maxY: 1998,
  },
  pitlaneStart: {
    minX: 1363,
    maxX: 1395,
    minY: 1905,
    maxY: 2067,
  },
  pitlaneEnd: {
    minX: -323,
    maxX: -291,
    minY: 1917,
    maxY: 2066,
  },
  drsStart: [
    {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
    },
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
    {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
    },
  ],
  checkpoints: [],
  TireDegradationPercentage: 10,
  BestTime: bestTimes.hungary,
  MainColor: [0xcd2a3e, 0xffffff, 0x477050],
  AvatarColor: 0x1e2b29,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
  lastPlace: {
    x: hungary_json.redSpawnPoints[hungary_json.redSpawnPoints.length - 1][0],
    y: hungary_json.redSpawnPoints[hungary_json.redSpawnPoints.length - 1][1],
  },
  CutDetectSegments: [
    {
      v0: [-1086, 2045],
      v1: [-1087, 1957],
      index: 184,
      penalty: 5,
    },
    {
      v0: [-1444, 1741],
      v1: [-1435, 1976],
      index: 185,
      penalty: 5,
    },
    {
      v0: [-259, 1470],
      v1: [-328, 1458],
      index: 186,
      penalty: 5,
    },
    {
      v0: [-1003, -924],
      v1: [-1200, -917],
      index: 187,
      penalty: 5,
    },
    {
      v0: [-360, -1434],
      v1: [-751, -1349],
      index: 188,
      penalty: 5,
    },
    {
      v0: [-292, -1246],
      v1: [-100, -1336],
      index: 189,
      penalty: 5,
    },
    {
      v0: [736, -1083],
      v1: [888, -1042],
      index: 190,
      penalty: 5,
    },
    {
      v0: [823, -1102],
      v1: [799, -986],
      index: 191,
      penalty: 5,
    },
    {
      v0: [1311, -282],
      v1: [1336, -319],
      index: 192,
      penalty: 5,
    },
    {
      v0: [1948, 352],
      v1: [2012, 436],
      index: 193,
      penalty: 5,
    },
    {
      v0: [1777, 1174],
      v1: [1656, 1090],
      index: 194,
      penalty: 5,
    },
    {
      v0: [1244, 1237],
      v1: [1195, 1321],
      index: 195,
      penalty: 5,
    },
    {
      v0: [601, 1355],
      v1: [734, 1271],
      index: 196,
      penalty: 5,
    },
    {
      v0: [601, 1355],
      v1: [679, 1470],
      index: 197,
      penalty: 5,
    },
  ],
};

export const HUNGARY: Circuit = {
  map: hungary_raw,
  info: HUNGARY_INFO,
};
