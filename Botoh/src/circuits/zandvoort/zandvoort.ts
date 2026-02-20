import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";
import { readFileSync } from "fs";
import { join } from "path";

const zandvoort_raw = readFileSync(join(__dirname, "zandvoort.hbs"), "utf-8");
const zandvoort_json = JSON.parse(zandvoort_raw);

const ZANDVOORT_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -54,
      maxX: 377,
      minY: -7,
      maxY: 216,
    },
    passingDirection: Direction.UP,
  },
  sectorOne: {
    bounds: {
      minX: -54,
      maxX: 377,
      minY: -7,
      maxY: 216,
    },
    passingDirection: Direction.UP,
  },
  sectorTwo: {
    bounds: {
      minX: 2338,
      maxX: 2370,
      minY: 733,
      maxY: 1085,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: 573,
      maxX: 605,
      minY: 1376,
      maxY: 1787,
    },
    passingDirection: Direction.RIGHT,
  },
  name: "Zandvoort by Rodri",
  boxLine: {
    minX: 86,
    maxX: 848,
    minY: -494,
    maxY: 271,
  },
  pitlaneStart: {
    minX: -290,
    maxX: -132,
    minY: 500,
    maxY: 532,
  },
  pitlaneEnd: {
    minX: 775,
    maxX: 852,
    minY: -566,
    maxY: -534,
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
    x: zandvoort_json.redSpawnPoints[
      zandvoort_json.redSpawnPoints.length - 1
    ][0],
    y: zandvoort_json.redSpawnPoints[
      zandvoort_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.zandvoort,
  MainColor: [0xae1c28, 0xffffff, 0x21468b],
  AvatarColor: 0x141414,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
  TireDegradationPercentage: 15,
  CutDetectSegments: [
    {
      v0: [1131.3857921101544, -70.47119561408442],
      v1: [883.4400000000002, -70.20000000000002],
      index: 123,
      penalty: 5,
    },
    {
      v0: [508.1708284621992, 171.79647358569207],
      v1: [525.3551899760813, 289.9837537224865],
      index: 124,
      penalty: 5,
    },
    {
      v0: [607.6080000000002, 1024.5744000000002],
      v1: [833.7600000000002, 811.0800000000002],
      index: 125,
      penalty: 5,
    },
    {
      v0: [2424.9526232566373, 2001.625533150682],
      v1: [2348.0000000000005, 1876.0000000000005],
      index: 126,
      penalty: 5,
    },
    {
      v0: [1754.6296296296298, 2171.2962962962965],
      v1: [1671.868202228391, 2075.7123390242705],
      index: 127,
      penalty: 5,
    },
    {
      v0: [224.97739274580593, 1539.407479502213],
      v1: [221.44800000000006, 1607.2976000000006],
      index: 128,
      penalty: 5,
    },
    {
      v0: [-53.33610044085481, 1431.8799741562707],
      v1: [40, 1250],
      index: 129,
      penalty: 5,
    },
    {
      v0: [-406.85206421972947, 1255.0284450322808],
      v1: [-326.19083304960014, 1473.7360610304008],
      index: 139,
      penalty: 5,
    },
  ],
};

export const ZANDVOORT: Circuit = {
  map: zandvoort_raw,
  info: ZANDVOORT_INFO,
};
