import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";
import { readFileSync } from "fs";
import { join } from "path";

const colorado_raw = readFileSync(join(__dirname, "colorado.hbs"), "utf-8");
const colorado_json = JSON.parse(colorado_raw);

const COLORADO_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 439.12691917482834,
      maxX: 471.1269192,
      minY: -84.53232390157366,
      maxY: 307.1876760984262,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorOne: {
    bounds: {
      minX: 439.12691917482834,
      maxX: 471.1269192,
      minY: -84.53232390157366,
      maxY: 307.1876760984262,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorTwo: {
    bounds: {
      minX: 191,
      maxX: 223,
      minY: 293,
      maxY: 465,
    },
    passingDirection: Direction.LEFT,
  },
  sectorThree: {
    bounds: {
      minX: -1485,
      maxX: -1258,
      minY: -129,
      maxY: -97,
    },
    passingDirection: Direction.UP,
  },
  name: "Colorado Street Circuit by New Era",
  boxLine: {
    minX: -382.07547136586754,
    maxX: -382.07547136586754,
    minY: 273.78617130070256,
    maxY: 273.78617130070256,
  },
  pitlaneStart: {
    minX: -50,
    maxX: 168,
    minY: 2,
    maxY: 34,
  },
  pitlaneEnd: {
    minX: 198,
    maxX: 373,
    minY: -106,
    maxY: -74,
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
    x: colorado_json.redSpawnPoints[colorado_json.redSpawnPoints.length - 1][0],
    y: colorado_json.redSpawnPoints[colorado_json.redSpawnPoints.length - 1][1],
  },
  BestTime: bestTimes.colorado,
  MainColor: [0x6b1414],
  AvatarColor: 0x8fdfff,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  pitSpeed: 1,
};

export const COLORADO: Circuit = {
  map: colorado_raw,
  info: COLORADO_INFO,
};
