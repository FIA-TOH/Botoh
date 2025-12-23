import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

const hocken_raw = readFileSync(join(__dirname, "hocken.hbs"), "utf-8");
const hocken_json = JSON.parse(hocken_raw);

const HOCKEN_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -3061,
      maxX: -2643,
      minY: -100,
      maxY: -70,
    },
    passingDirection: Direction.UP,
  },
  sectorOne: {
    bounds: {
      minX: -3061,
      maxX: -2643,
      minY: -100,
      maxY: -70,
    },
    passingDirection: Direction.UP,
  },
  sectorTwo: {
    bounds: {
      minX: -1595,
      maxX: -781,
      minY: -984,
      maxY: -952,
    },
    passingDirection: Direction.DOWN,
  },
  sectorThree: {
    bounds: {
      minX: -580,
      maxX: -548,
      minY: 1641,
      maxY: 1984,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Hockenheimring - By Ximb",
  boxLine: {
    minX: -2733,
    maxX: -2641,
    minY: -63,
    maxY: 937,
  },
  pitlaneStart: {
    minX: -2810,
    maxX: -2733,
    minY: 1420,
    maxY: 1450,
  },
  pitlaneEnd: {
    minX: -2809,
    maxX: -2733,
    minY: -925,
    maxY: -895,
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
  lastPlace: {
    x: hocken_json.redSpawnPoints[hocken_json.redSpawnPoints.length - 1][0],
    y: hocken_json.redSpawnPoints[hocken_json.redSpawnPoints.length - 1][1],
  },
  BestTime: bestTimes.hockenheimring,
  MainColor: [0x000001, 0xed2939, 0xfae042],
  AvatarColor: 0xffffff,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  TireDegradationPercentage: 0,
  CutDetectSegments: [
    {
      v0: [-3004, 617],
      v1: [-3057, 617],
      index: 150,
      penalty: 5,
    },
    {
      v0: [-2414, -1468],
      v1: [-2311, -1786],
      index: 151,
      penalty: 5,
    },
    {
      v0: [-2311, -1786],
      v1: [-2004, -1608],
      index: 152,
      penalty: 5,
    },
    {
      v0: [-961, -1652],
      v1: [-940, -1564],
      index: 153,
      penalty: 5,
    },
    {
      v0: [-940, -1564],
      v1: [-1009, -1392],
      index: 154,
      penalty: 5,
    },
    {
      v0: [-931, -1170],
      v1: [-799, -1160],
      index: 155,
      penalty: 5,
    },
    {
      v0: [-960, -772],
      v1: [-1118, -522],
      index: 156,
      penalty: 5,
    },
    {
      v0: [-655, -384],
      v1: [-815, -259],
      index: 157,
      penalty: 5,
    },
    {
      v0: [-246, 43],
      v1: [-321, 155],
      index: 158,
      penalty: 5,
    },
    {
      v0: [145, 361],
      v1: [84, 451],
      index: 159,
      penalty: 5,
    },
    {
      v0: [616, 658],
      v1: [551, 771],
      index: 160,
      penalty: 5,
    },
    {
      v0: [1169, 931],
      v1: [1692, 1113],
      index: 161,
      penalty: 5,
    },
    {
      v0: [1692, 1113],
      v1: [2228, 1199],
      index: 162,
      penalty: 5,
    },
    {
      v0: [1570, 1473],
      v1: [1589, 1383],
      index: 163,
      penalty: 5,
    },
    {
      v0: [839, 1216],
      v1: [580, 1448],
      index: 164,
      penalty: 5,
    },
    {
      v0: [296, 835],
      v1: [296, 933],
      index: 165,
      penalty: 5,
    },
    {
      v0: [189, 1550],
      v1: [-285, 1425],
      index: 166,
      penalty: 5,
    },
    {
      v0: [-382, 1837],
      v1: [-388, 1954],
      index: 167,
      penalty: 5,
    },
    {
      v0: [-1327, 1596],
      v1: [-1278, 1532],
      index: 168,
      penalty: 5,
    },
    {
      v0: [-1763, 1118],
      v1: [-1889, 1130],
      index: 169,
      penalty: 5,
    },
    {
      v0: [-2278, 730],
      v1: [-2019, 623],
      index: 170,
      penalty: 5,
    },
    {
      v0: [-2142, 1029],
      v1: [-2487, 1450],
      index: 171,
      penalty: 5,
    },
    {
      v0: [-2172, 1606],
      v1: [-2487, 1450],
      index: 172,
      penalty: 5,
    },
  ],
};

export const HOCKEN: Circuit = {
  map: hocken_raw,
  info: HOCKEN_INFO,
};
