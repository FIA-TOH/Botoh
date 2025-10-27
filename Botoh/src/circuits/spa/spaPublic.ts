import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

import { readFileSync } from "fs";
import { join } from "path";

const spaPublic_raw = readFileSync(join(__dirname, "spaPublic.hbs"), "utf-8");
const spaPublic_json = JSON.parse(spaPublic_raw);

const SPAPUBLIC_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -2963,
      maxX: -2932,
      minY: -1120,
      maxY: -747,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Spa-Francorchamps - By Ximb",
  sectorOne: {
    bounds: {
      minX: -2963,
      maxX: -2932,
      minY: -1120,
      maxY: -747,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: 2795,
      maxX: 2827,
      minY: -1641,
      maxY: -1385,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: 1974,
      maxX: 2372,
      minY: 1620,
      maxY: 1652,
    },
    passingDirection: Direction.DOWN,
  },
  boxLine: {
    minX: -2960,
    maxX: -1670,
    minY: -1120,
    maxY: -1018,
  },
  pitlaneStart: {
    minX: -1166,
    maxX: -1134,
    minY: -1107,
    maxY: -953,
  },
  pitlaneEnd: {
    minX: -3195,
    maxX: -3165,
    minY: -1215,
    maxY: -960,
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
    x: spaPublic_json.redSpawnPoints[
      spaPublic_json.redSpawnPoints.length - 1
    ][0],
    y: spaPublic_json.redSpawnPoints[
      spaPublic_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.spa,
  MainColor: [0x000001, 0xfae042, 0xed2939],
  AvatarColor: 0xffffff,
  Angle: 0,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
  TireDegradationPercentage: -5,
  CutDetectSegments: [
    {
      v0: [-1006, -1778],
      v1: [-914, -1745],
      index: 0,
      penalty: 5,
    },
    {
      v0: [-657, -1736],
      v1: [-291, -1537],
      index: 1,
      penalty: 5,
    },
    {
      v0: [-176, -1768],
      v1: [-133, -1790],
      index: 2,
      penalty: 5,
    },
    {
      v0: [3271, -1088],
      v1: [3756, -1440],
      index: 3,

      penalty: 5,
    },
    {
      v0: [3327, -438],
      v1: [3350, -496],
      index: 4,

      penalty: 5,
    },
    {
      v0: [1504, -585],
      v1: [1530, -614],
      index: 5,

      penalty: 5,
    },
    {
      v0: [2051, 1682],
      v1: [2117, 1904],
      index: 6,

      penalty: 5,
    },
    {
      v0: [1537, 1871],
      v1: [1630, 2028],
      index: 7,

      penalty: 5,
    },
    {
      v0: [1386, 1712],
      v1: [1428, 1665],
      index: 8,

      penalty: 5,
    },
    {
      v0: [1312, 1468],
      v1: [1389, 1466],
      index: 9,

      penalty: 5,
    },
    {
      v0: [1313, 1314],
      v1: [1429, 1144],
      index: 10,
      penalty: 5,
    },
    {
      v0: [1430, 525],
      v1: [1391, 639],
      index: 11,
      penalty: 5,
    },
    {
      v0: [1382, 306],
      v1: [1390, 505],
      index: 12,
      penalty: 5,
    },
    {
      v0: [1237, 114],
      v1: [1334, 323],
      index: 13,
      penalty: 5,
    },
    {
      v0: [1017, -3],
      v1: [1168, 108],
      index: 14,
      penalty: 5,
    },
    {
      v0: [501, -223],
      v1: [418, -506],
      index: 15,
      penalty: 5,
    },
    {
      v0: [-200, -243],
      v1: [-92, -731],
      index: 16,
      penalty: 5,
    },
    {
      v0: [-1146, -468],
      v1: [-423, -879],
      index: 17,
      penalty: 5,
    },
    {
      v0: [-1183, -759],
      v1: [-1140, -754],
      index: 18,
      penalty: 5,
    },
    {
      v0: [2334, 926],
      v1: [2113, 1010],
      index: 183,
      penalty: 5,
    },
  ],
};

export const SPAPUBLIC: Circuit = {
  map: spaPublic_raw,
  info: SPAPUBLIC_INFO,
};
