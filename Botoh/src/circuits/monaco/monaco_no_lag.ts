import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

const monaco_no_lag_raw = readFileSync(
  join(__dirname, "monaco_no_lag.hbs"),
  "utf-8"
);
const monaco_no_lag_json = JSON.parse(monaco_no_lag_raw);

const MONACO_NO_LAG_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 70,
      maxX: 100,
      minY: -110,
      maxY: 157,
    },
    passingDirection: Direction.LEFT,
  },
  sectorOne: {
    bounds: {
      minX: 70,
      maxX: 100,
      minY: -110,
      maxY: 157,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: -2230,
      maxX: -2120,
      minY: -3100,
      maxY: -3070,
    },
    passingDirection: Direction.UP,
  },
  sectorThree: {
    bounds: {
      minX: 170,
      maxX: 201,
      minY: -380,
      maxY: -277,
    },
    passingDirection: Direction.RIGHT,
  },
  name: "Circuit de Monaco - By Ximb",
  boxLine: {
    minX: 103,
    maxX: 954,
    minY: -170,
    maxY: -22,
  },
  pitlaneStart: {
    minX: 1216,
    maxX: 1246,
    minY: -315,
    maxY: -107,
  },
  pitlaneEnd: {
    minX: 7,
    maxX: 37,
    minY: -54,
    maxY: 13,
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
    x: monaco_no_lag_json.redSpawnPoints[
      monaco_no_lag_json.redSpawnPoints.length - 1
    ][0],
    y: monaco_no_lag_json.redSpawnPoints[
      monaco_no_lag_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.monaco_no_lag,
  MainColor: [0xd6001d, 0xd6001d, 0xffffff],
  AvatarColor: 0xffffff,
  Angle: 60,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
  TireDegradationPercentage: -40,
  CutDetectSegments: [
    {
      v0: [454, -219],
      v1: [496, -280],
      index: 150,
      penalty: 5,
    },
    {
      v0: [-675, -1131],
      v1: [-847, -1055],
      index: 171,
      penalty: 7,
    },
    {
      v0: [-847, -1055],
      v1: [-681, -1065],
      index: 172,
      penalty: 7,
    },
    {
      v0: [-840, -122],
      v1: [-866, -86],
      index: 190,
      penalty: 5,
    },
  ],
};

export const MONACO_NO_LAG: Circuit = {
  map: monaco_no_lag_raw,
  info: MONACO_NO_LAG_INFO,
};
