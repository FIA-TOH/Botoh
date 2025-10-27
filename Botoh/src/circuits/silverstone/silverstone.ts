import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

const silverstone_raw = readFileSync(
  join(__dirname, "silverstone.hbs"),
  "utf-8"
);
const silverstone_json = JSON.parse(silverstone_raw);

const SILVERSTONE_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -1300,
      maxX: -1268,
      minY: -1200,
      maxY: -763,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorOne: {
    bounds: {
      minX: -1300,
      maxX: -1270,
      minY: -1200,
      maxY: -763,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorTwo: {
    bounds: {
      minX: 1336,
      maxX: 1663,
      minY: -1059,
      maxY: -1029,
    },
    passingDirection: Direction.UP,
  },
  sectorThree: {
    bounds: {
      minX: -105,
      maxX: -75,
      minY: 787,
      maxY: 1039,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Silverstone Circuit - By Ximb",
  boxLine: {
    minX: -2202,
    maxX: -1300,
    minY: -838,
    maxY: -763,
  },
  pitlaneStart: {
    minX: -2610,
    maxX: -2377,
    minY: -335,
    maxY: -303,
  },
  pitlaneEnd: {
    minX: -1061,
    maxX: -1029,
    minY: -956,
    maxY: -762,
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
    x: silverstone_json.redSpawnPoints[
      silverstone_json.redSpawnPoints.length - 1
    ][0],
    y: silverstone_json.redSpawnPoints[
      silverstone_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.silverstone,
  MainColor: [0x023286, 0x023286, 0xff0000],
  AvatarColor: 0xffffff,
  Angle: 60,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
  TireDegradationPercentage: 15,
  CutDetectSegments: [
    {
      v0: [1112, -230],
      v1: [1040, -18],
      index: 93,
      penalty: 10,
    },
    {
      v0: [-3049, 76],
      v1: [-2832, -84],
      index: 104,
      penalty: 5,
    },
    {
      v0: [582, -220],
      v1: [-374, 28],
      index: 156,
      penalty: 5,
    },
    {
      v0: [-282, -502],
      v1: [-45, -894],
      index: 161,
      penalty: 5,
    },
    {
      v0: [564, 179],
      v1: [1040, -18],
      index: 162,
      penalty: 10,
    },
    {
      v0: [1037, 735],
      v1: [1725, 1476],
      index: 163,
      penalty: 5,
    },
    {
      v0: [-2882, -961],
      v1: [-3063, -263],
      index: 181,
      penalty: 5,
    },
    {
      v0: [-745, -952],
      v1: [-611, -661],
      index: 182,
      penalty: 5,
    },
    {
      v0: [-2021, -1167],
      v1: [-2021, -1209],
      index: 183,
      penalty: 5,
    },
    {
      v0: [1416, -1365],
      v1: [1351, -1263],
      index: 186,
      penalty: 5,
    },
    {
      v0: [960, -1648],
      v1: [809, -1520],
      index: 187,
      penalty: 5,
    },
    {
      v0: [809, -1520],
      v1: [902, -1377],
      index: 188,
      penalty: 5,
    },
    {
      v0: [2262, -1281],
      v1: [2342, -1312],
      index: 189,
      penalty: 5,
    },
    {
      v0: [2483, -963],
      v1: [2550, -990],
      index: 190,
      penalty: 5,
    },
    {
      v0: [2468, -543],
      v1: [2455, -399],
      index: 192,
      penalty: 5,
    },
    {
      v0: [1803, 365],
      v1: [2061, 420],
      index: 193,
      penalty: 5,
    },
    {
      v0: [1577, 541],
      v1: [1371, 324],
      index: 194,
      penalty: 5,
    },
    {
      v0: [529, 1185],
      v1: [282, 809],
      index: 195,
      penalty: 5,
    },
  ],
};

export const SILVERSTONE: Circuit = {
  map: silverstone_raw,
  info: SILVERSTONE_INFO,
};
