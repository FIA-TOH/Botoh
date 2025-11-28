import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

import { readFileSync } from "fs";
import { join } from "path";
const imola_raw = readFileSync(join(__dirname, "imola.hbs"), "utf-8");
const imola_json = JSON.parse(imola_raw);

const IMOLA_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -168,
      maxX: -138,
      minY: 1010,
      maxY: 1345,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorOne: {
    bounds: {
      minX: -168,
      maxX: -138,
      minY: 1010,
      maxY: 1345,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorTwo: {
    bounds: {
      minX: 2982,
      maxX: 3014,
      minY: -1638,
      maxY: -1308,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: -184,
      maxX: -154,
      minY: 158,
      maxY: 396,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Autodromo Imola - By Ximb",
  boxLine: {
    minX: -1068,
    maxX: -168,
    minY: 1263,
    maxY: 1345,
  },
  pitlaneStart: {
    minX: -1266,
    maxX: -1236,
    minY: 1194,
    maxY: 1345,
  },
  pitlaneEnd: {
    minX: 474,
    maxX: 506,
    minY: 1328,
    maxY: 1452,
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
  MainColor: [0x009246, 0xfffff1, 0xce2b37],
  AvatarColor: 0x000001,
  Angle: 0,
  Limit: 5,
  Votes: 0,
  TireDegradationPercentage: 5,
  CutDetectSegments: [
    {
      v0: [1862, 909],
      v1: [1571, 801],
      index: 236,
      penalty: 5,
    },
    {
      v0: [1889, 626],
      v1: [2583, 712],
      index: 237,
      penalty: 5,
    },
    {
      v0: [2307, 217],
      v1: [2154, 51],
      index: 238,
      penalty: 5,
    },
    {
      v0: [2617, -166],
      v1: [2649, -343],
      index: 239,
      penalty: 5,
    },
    {
      v0: [2508, -857],
      v1: [2274, -820],
      index: 240,
      penalty: 5,
    },
    {
      v0: [2404, -1144],
      v1: [2781, -1098],
      index: 241,
      penalty: 5,
    },
    {
      v0: [2252, -668],
      v1: [2215, -787],
      index: 242,
      penalty: 5,
    },
    {
      v0: [1323, -1532],
      v1: [1355, -1488],
      index: 243,
      penalty: 5,
    },
    {
      v0: [1267, -478],
      v1: [1329, -278],
      index: 244,
      penalty: 5,
    },
    {
      v0: [1292, 298],
      v1: [1318, 137],
      index: 245,
      penalty: 5,
    },
    {
      v0: [1118, 205],
      v1: [842, 478],
      index: 246,
      penalty: 5,
    },
    {
      v0: [-715, 234],
      v1: [-654, 194],
      index: 247,
      penalty: 5,
    },
    {
      v0: [-814, 110],
      v1: [-1350, 502],
      index: 248,
      penalty: 5,
    },
    {
      v0: [-1792, 488],
      v1: [-1676, 573],
      index: 249,
      penalty: 5,
    },
    {
      v0: [-2226, 927],
      v1: [-2299, 855],
      index: 250,
      penalty: 5,
    },
    {
      v0: [-2727, 1194],
      v1: [-2306, 1354],
      index: 251,
      penalty: 5,
    },
    {
      v0: [-2540, 1591],
      v1: [-2497, 1485],
      index: 252,
      penalty: 5,
    },
    {
      v0: [-1363, 1295],
      v1: [-1329, 1359],
      index: 253,
      penalty: 5,
    },
  ],
};

export const IMOLA: Circuit = {
  map: imola_raw,
  info: IMOLA_INFO,
};
