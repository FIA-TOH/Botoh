import { bestTimes } from "../bestTimes";

import { readFileSync } from "fs";
import { join } from "path";

import { Circuit, CircuitInfo, Direction } from "../Circuit";

const hungary_raw = readFileSync(join(__dirname, "hungary.hbs"), "utf-8");
const hungary_json = JSON.parse(hungary_raw);

const HUNGARY_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -26,
      maxX: 4,
      minY: -122,
      maxY: 280,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Hungaroring - By Ximb",
  boxLine: {
    minX: 0,
    maxX: 1000,
    minY: -122,
    maxY: -36,
  },
  pitlaneStart: {
    minX: 1582,
    maxX: 1612,
    minY: -36,
    maxY: 34,
  },
  pitlaneEnd: {
    minX: -151,
    maxX: -121,
    minY: -122,
    maxY: 34,
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
  TireDegradationPercentage: 10,
  lastPlace: {
    x: hungary_json.redSpawnPoints[hungary_json.redSpawnPoints.length - 1][0],
    y: hungary_json.redSpawnPoints[hungary_json.redSpawnPoints.length - 1][1],
  },
};

export const HUNGARY: Circuit = {
  map: hungary_raw,
  info: HUNGARY_INFO,
};
