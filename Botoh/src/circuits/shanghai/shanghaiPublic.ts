import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

import { readFileSync } from "fs";
import { join } from "path";

const shanghaiPublic_raw = readFileSync(
  join(__dirname, "shanghaiPublic.hbs"),
  "utf-8"
);
const shanghaiPublic_json = JSON.parse(shanghaiPublic_raw);

const SHANGHAIPUBLIC_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -642,
      maxX: -610,
      minY: -125,
      maxY: 247,
    },
    passingDirection: Direction.LEFT,
  },
  sectorOne: {
    bounds: {
      minX: -642,
      maxX: -610,
      minY: -125,
      maxY: 247,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: -1915,
      maxX: -1510,
      minY: -1780,
      maxY: -1748,
    },
    passingDirection: Direction.UP,
  },
  sectorThree: {
    bounds: {
      minX: 69,
      maxX: 360,
      minY: -2234,
      maxY: -2202,
    },
    passingDirection: Direction.UP,
  },
  name: "Shanghai International Circuit - By Ximb",
  boxLine: {
    minX: -610,
    maxX: 390,
    minY: -125,
    maxY: -52,
  },
  pitlaneStart: {
    minX: 450,
    maxX: 482,
    minY: -165,
    maxY: 26,
  },
  pitlaneEnd: {
    minX: -837,
    maxX: -805,
    minY: -126,
    maxY: 26,
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
    x: shanghaiPublic_json.redSpawnPoints[
      shanghaiPublic_json.redSpawnPoints.length - 1
    ][0],
    y: shanghaiPublic_json.redSpawnPoints[
      shanghaiPublic_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.shanghai,
  MainColor: [0xd6001d],
  AvatarColor: 0xfae100,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
  CutDetectSegments: [
    {
      v0: [-1510, -1704],
      v1: [-1583, -1698],
      index: 134,
      penalty: 5,
    },
    {
      v0: [531, -97],
      v1: [390, -125],
      index: 166,
      penalty: 5,
    },
    {
      v0: [-1212, -1106],
      v1: [-1181, -1238],
      index: 174,
      penalty: 5,
    },
    {
      v0: [-1403, -1016],
      v1: [-1524, -1044],
      index: 175,
      penalty: 5,
    },
    {
      v0: [-1315, -1431],
      v1: [-1397, -1397],
      index: 176,
      penalty: 5,
    },
    {
      v0: [-1583, -2036],
      v1: [-1625, -2219],
      index: 177,
      penalty: 5,
    },
    {
      v0: [110, -1305],
      v1: [144, -1362],
      index: 184,
      penalty: 5,
    },
    {
      v0: [380, -1480],
      v1: [416, -1462],
      index: 185,
      penalty: 5,
    },
    {
      v0: [265, -2322],
      v1: [313, -2336],
      index: 186,
      penalty: 5,
    },
    {
      v0: [68, -2263],
      v1: [8, -2419],
      index: 187,
      penalty: 5,
    },
    {
      v0: [1674, 1200],
      v1: [1754, 1279],
      index: 192,
      penalty: 5,
    },
    {
      v0: [416, -1950],
      v1: [465, -1972],
      index: 193,
      penalty: 5,
    },
    {
      v0: [775, 28],
      v1: [740, -110],
      index: 194,
      penalty: 5,
    },
    {
      v0: [-1521, 33],
      v1: [-1795, -104],
      index: 195,
      penalty: 10,
    },
    {
      v0: [-1795, -104],
      v1: [-1893, -346],
      index: 196,
      penalty: 10,
    },
    {
      v0: [-1893, -346],
      v1: [-1793, -574],
      index: 197,
      penalty: 7,
    },
    {
      v0: [-1793, -574],
      v1: [-1624, -634],
      index: 198,
      penalty: 7,
    },
    {
      v0: [-1624, -634],
      v1: [-1437, -560],
      index: 199,
      penalty: 5,
    },
    {
      v0: [-1437, -560],
      v1: [-1378, -428],
      index: 200,
      penalty: 5,
    },
    {
      v0: [-1114, -1586],
      v1: [-976, -1445],
      index: 201,
      penalty: 5,
    },
    {
      v0: [-976, -1445],
      v1: [-796, -1438],
      index: 202,
      penalty: 5,
    },
    {
      v0: [-796, -1438],
      v1: [-660, -1537],
      index: 203,
      penalty: 5,
    },
    {
      v0: [-380, -1671],
      v1: [-271, -1755],
      index: 204,
      penalty: 5,
    },
    {
      v0: [-271, -1755],
      v1: [-124, -1719],
      index: 205,
      penalty: 5,
    },
    {
      v0: [-13, -1620],
      v1: [-82, -1500],
      index: 206,
      penalty: 5,
    },
    {
      v0: [-170, -2505],
      v1: [-367, -2406],
      index: 207,
      penalty: 5,
    },
    {
      v0: [-367, -2406],
      v1: [-478, -2514],
      index: 208,
      penalty: 5,
    },
    {
      v0: [-478, -2514],
      v1: [-496, -2692],
      index: 209,
      penalty: 5,
    },
    {
      v0: [-496, -2692],
      v1: [-346, -2888],
      index: 210,
      penalty: 5,
    },
    {
      v0: [-346, -2888],
      v1: [-103, -2928],
      index: 211,
      penalty: 5,
    },
    {
      v0: [-103, -2928],
      v1: [138, -2771],
      index: 212,
      penalty: 5,
    },
  ],
};

export const SHANGHAIPUBLIC: Circuit = {
  map: shanghaiPublic_raw,
  info: SHANGHAIPUBLIC_INFO,
};
