import { readFileSync } from "fs";
import { join } from "path";

import { Circuit, CircuitInfo, Direction } from "../Circuit";
import { bestTimes } from "../bestTimes";

const austinPublic_raw = readFileSync(
  join(__dirname, "austinPublic.hbs"),
  "utf-8"
);
const austinPublic_json = JSON.parse(austinPublic_raw);

const AUSTINPUBLIC_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -2800,
      maxX: -2430,
      minY: -1315,
      maxY: -1285,
    },
    passingDirection: Direction.DOWN,
  },
  sectorOne: {
    bounds: {
      minX: -2800,
      maxX: -2430,
      minY: -1315,
      maxY: -1285,
    },
    passingDirection: Direction.DOWN,
  },
  sectorTwo: {
    bounds: {
      minX: 867,
      maxX: 2067,
      minY: 807,
      maxY: 839,
    },
    passingDirection: Direction.DOWN,
  },
  sectorThree: {
    bounds: {
      minX: 208,
      maxX: 595,
      minY: -844,
      maxY: -812,
    },
    passingDirection: Direction.DOWN,
  },
  name: "United States Grand Prix - By Ximb",
  boxLine: {
    minX: -2515,
    maxX: -2430,
    minY: -1991,
    maxY: -1285,
  },
  pitlaneStart: {
    minX: -2582,
    maxX: -2430,
    minY: -2037,
    maxY: -2007,
  },
  pitlaneEnd: {
    minX: -2584,
    maxX: -2498,
    minY: -952,
    maxY: -922,
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
    x: austinPublic_json.redSpawnPoints[
      austinPublic_json.redSpawnPoints.length - 1
    ][0],
    y: austinPublic_json.redSpawnPoints[
      austinPublic_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.austin,
  MainColor: [0xb31942, 0xffffff, 0xb31942],
  AvatarColor: 0x0a3161,
  Angle: 90,
  Limit: 4,
  Votes: 0,
  pitSpeed: 0.97,
  CutDetectSegments: [
    {
      v0: [-2522, 645],
      v1: [-2517, 581],
      index: 183,
      penalty: 5,
    },
    {
      v0: [-1967, 175],
      v1: [-1848, 249],
      index: 184,
      penalty: 5,
    },
    {
      v0: [-1081, 426],
      v1: [-1038, -26],
      index: 185,
      penalty: 5,
    },
    {
      v0: [-635, 372],
      v1: [-769, 865],
      index: 186,
      penalty: 5,
    },
    {
      v0: [-42, 140],
      v1: [-77, 606],
      index: 187,
      penalty: 5,
    },
    {
      v0: [429, 521],
      v1: [492, 712],
      index: 188,
      penalty: 5,
    },
    {
      v0: [492, 712],
      v1: [768, 593],
      index: 189,
      penalty: 5,
    },
    {
      v0: [1279, 974],
      v1: [2077, 496],
      index: 190,
      penalty: 5,
    },
    {
      v0: [1648, 1389],
      v1: [1722, 1214],
      index: 191,
      penalty: 5,
    },
    {
      v0: [2119, 1409],
      v1: [1964, 1425],
      index: 192,
      penalty: 5,
    },
    {
      v0: [3647, 2264],
      v1: [3814, 2258],
      index: 193,
      penalty: 5,
    },
    {
      v0: [676, -1350],
      v1: [625, -1393],
      index: 194,
      penalty: 5,
    },
    {
      v0: [185, -629],
      v1: [161, -306],
      index: 195,
      penalty: 5,
    },
    {
      v0: [7, -265],
      v1: [185, -629],
      index: 196,
      penalty: 5,
    },
    {
      v0: [-266, -648],
      v1: [-7, -669],
      index: 197,
      penalty: 5,
    },
    {
      v0: [-137, -964],
      v1: [-151, -1245],
      index: 198,
      penalty: 5,
    },
    {
      v0: [-57, -1271],
      v1: [-151, -1245],
      index: 199,
      penalty: 5,
    },
    {
      v0: [-223, -1481],
      v1: [-317, -1285],
      index: 200,
      penalty: 5,
    },
    {
      v0: [-766, -1001],
      v1: [-791, -868],
      index: 201,
      penalty: 5,
    },
    {
      v0: [-1314, -778],
      v1: [-1271, -820],
      index: 202,
      penalty: 5,
    },
    {
      v0: [-1451, -1005],
      v1: [-1378, -1140],
      index: 203,
      penalty: 5,
    },
    {
      v0: [-1577, -1572],
      v1: [-1498, -1714],
      index: 204,
      penalty: 5,
    },
    {
      v0: [-2548, -2178],
      v1: [-2442, -2161],
      index: 205,
      penalty: 5,
    },
    {
      v0: [-1930, -2165],
      v1: [-1866, -2280],
      index: 206,
      penalty: 5,
    },
  ],
};

export const AUSTINPUBLIC: Circuit = {
  map: austinPublic_raw,
  info: AUSTINPUBLIC_INFO,
};
