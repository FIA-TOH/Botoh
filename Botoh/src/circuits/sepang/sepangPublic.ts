

import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

const sepangPublic_raw = readFileSync(join(__dirname, "sepangPublic.hbs"), "utf-8");
const sepangPublic_json = JSON.parse(sepangPublic_raw);




const SEPANGPUBLIC_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 102,
      maxX: 132,
      minY: -345,
      maxY: 6,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Sepang F1 International Circuit - By Ximb",
  sectorOne: {
    bounds: {
      minX: 102,
      maxX: 132,
      minY: -345,
      maxY: 6,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: -1161,
      maxX: -1130,
      minY: -2006,
      maxY: -1732,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: 667,
      maxX: 699,
      minY: 413,
      maxY: 628,
    },
    passingDirection: Direction.LEFT,
  },
  boxLine: {
    minX: 133,
    maxX: 1226,
    minY: -345,
    maxY: -277,
  },
  pitlaneStart: {
    minX: 1496,
    maxX: 1526,
    minY: -435,
    maxY: -268,
  },
  pitlaneEnd: {
    minX: -219,
    maxX: -199,
    minY: -313,
    maxY: -183,
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
    x: sepangPublic_json.redSpawnPoints[
      sepangPublic_json.redSpawnPoints.length - 1
    ][0],
    y: sepangPublic_json.redSpawnPoints[
      sepangPublic_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.sepang,
  MainColor: [0xc70000, 0x000080, 0xffffff],
  AvatarColor: 0xffd800,
  Angle: 0,
  Limit: 5,
  Votes: 0,
  CutDetectSegments: [
    {
      v0: [1749, -82],
      v1: [2026, -120],
      index: 151,
      penalty: 5,
    },
    {
      v0: [-2437, -304],
      v1: [-2347, -185],
      index: 152,
      penalty: 5,
    },
    {
      v0: [-2332, -383],
      v1: [-2347, -185],
      index: 153,
      penalty: 5,
    },
    {
      v0: [-1978, -907],
      v1: [-1659, -669],
      index: 154,
      penalty: 5,
    },
    {
      v0: [-1851, -1466],
      v1: [-1829, -1372],
      index: 155,
      penalty: 5,
    },
    {
      v0: [196, -1940],
      v1: [130, -1842],
      index: 156,
      penalty: 5,
    },
    {
      v0: [2316, 3],
      v1: [2026, -120],
      index: 157,
      penalty: 5,
    },
    {
      v0: [-1153, 894],
      v1: [-1428, 823],
      index: 158,
      penalty: 5,
    },
    {
      v0: [-1477, 979],
      v1: [-1428, 823],
      index: 159,
      penalty: 5,
    },
    {
      v0: [1333, 283],
      v1: [1428, 361],
      index: 160,
      penalty: 5,
    },
    {
      v0: [455, -1577],
      v1: [586, -1580],
      index: 161,
      penalty: 5,
    },
    {
      v0: [774, 338],
      v1: [1428, 361],
      index: 174,
      penalty: 5,
    },
    {
      v0: [2261, -497],
      v1: [2297, -645],
      index: 176,
      penalty: 5,
    },
    {
      v0: [1462, -930],
      v1: [1504, -435],
      index: 177,
      penalty: 5,
    },
    {
      v0: [1694, -879],
      v1: [1504, -435],
      index: 178,
      penalty: 5,
    },
  ],
};

export const SEPANGPUBLIC: Circuit = {
  map: sepangPublic_raw,
  info: SEPANGPUBLIC_INFO,
};
