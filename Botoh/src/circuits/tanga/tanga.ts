import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, CircuitPhysics, Direction } from "../Circuit";
import { readFileSync } from "fs";
import { join } from "path";

const tanga_raw = readFileSync(join(__dirname, "tanga.hbs"), "utf-8");
const tanga_json = JSON.parse(tanga_raw);

const TANGA_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 1,
      maxX: 33,
      minY: 15,
      maxY: 165,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorOne: {
    bounds: {
      minX: 1,
      maxX: 33,
      minY: 15,
      maxY: 165,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorTwo: {
    bounds: {
      minX: 1303,
      maxX: 1335,
      minY: 193,
      maxY: 365,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: 90,
      maxX: 122,
      minY: 691,
      maxY: 856,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Tanga Automobile by PYOTER",
  boxLine: {
    minX: 765,
    maxX: 765,
    minY: 90,
    maxY: 90,
  },
  pitlaneStart: {
    minX: 765,
    maxX: 765,
    minY: 90,
    maxY: 90,
  },
  pitlaneEnd: {
    minX: 765,
    maxX: 765,
    minY: 90,
    maxY: 90,
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
    x: tanga_json.redSpawnPoints[tanga_json.redSpawnPoints.length - 1][0],
    y: tanga_json.redSpawnPoints[tanga_json.redSpawnPoints.length - 1][1],
  },
  BestTime: bestTimes.tanga,
  MainColor: [0xc6f57e],
  AvatarColor: 0x3c4a26,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
  physicsType: CircuitPhysics.CLASSIC,
};

export const TANGA: Circuit = {
  map: tanga_raw,
  info: TANGA_INFO,
};
