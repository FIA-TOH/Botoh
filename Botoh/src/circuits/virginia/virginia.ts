import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

const virginia_raw = readFileSync(join(__dirname, "virginia.hbs"), "utf-8");
const virginia_json = JSON.parse(virginia_raw);

const VIRGINIA_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -27,
      maxX: 5,
      minY: 28,
      maxY: 500,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Virginia International Raceway by DavidMC49",
  sectorOne: {
    bounds: {
      minX: -27,
      maxX: 5,
      minY: 28,
      maxY: 500,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: 278,
      maxX: 944,
      minY: -953,
      maxY: -921,
    },
    passingDirection: Direction.UP,
  },
  sectorThree: {
    bounds: {
      minX: 1937,
      maxX: 2119,
      minY: -1498,
      maxY: -1466,
    },
    passingDirection: Direction.DOWN,
  },
  boxLine: {
    minX: 825,
    maxX: 825,
    minY: 90,
    maxY: 90,
  },
  pitlaneStart: {
    minX: 2149,
    maxX: 2181,
    minY: 222,
    maxY: 373,
  },
  pitlaneEnd: {
    minX: 352,
    maxX: 384,
    minY: 241,
    maxY: 373,
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
    x: virginia_json.redSpawnPoints[virginia_json.redSpawnPoints.length - 1][0],
    y: virginia_json.redSpawnPoints[virginia_json.redSpawnPoints.length - 1][1],
  },
  BestTime: bestTimes.virginia,
  MainColor: [0x003000, 0x003000, 0x003000],
  AvatarColor: 0xffff00,
  Angle: 0,
  Limit: 5,
  Votes: 0,
  pitSpeed: 1,
  TireDegradationPercentage: 0,
};

export const VIRGINIA: Circuit = {
  map: virginia_raw,
  info: VIRGINIA_INFO,
};
