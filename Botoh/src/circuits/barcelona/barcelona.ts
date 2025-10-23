import { bestTimes } from "../bestTimes";

import { readFileSync } from "fs";
import { join } from "path";

import { Circuit, CircuitInfo, Direction } from "../Circuit";

const barcelona_raw = readFileSync(join(__dirname, "barcelona.hbs"), "utf-8");
const barcelona_json = JSON.parse(barcelona_raw);

const BARCELONA_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 268,
      maxX: 298,
      minY: -13,
      maxY: 256,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Barcelona Circuit",
  boxLine: {
    minX: 402,
    maxX: 1122,
    minY: -13,
    maxY: 47,
  },
  pitlaneStart: {
    minX: 1322,
    maxX: 1352,
    minY: -144,
    maxY: -49,
  },
  pitlaneEnd: {
    minX: -300,
    maxX: -200,
    minY: 64,
    maxY: 94,
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
  TireDegradationPercentage: 25,
  lastPlace: {
    x: barcelona_json.redSpawnPoints[
      barcelona_json.redSpawnPoints.length - 1
    ][0],
    y: barcelona_json.redSpawnPoints[
      barcelona_json.redSpawnPoints.length - 1
    ][1],
  },
};

export const BARCELONA: Circuit = {
  map: barcelona_raw,
  info: BARCELONA_INFO,
};
