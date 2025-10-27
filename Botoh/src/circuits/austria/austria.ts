import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

const austria_raw = readFileSync(join(__dirname, "austria.hbs"), "utf-8");
const austria_json = JSON.parse(austria_raw);

const AUSTRIA_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 1,
      maxX: 33,
      minY: 44,
      maxY: 377,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorOne: {
    bounds: {
      minX: 1,
      maxX: 33,
      minY: 44,
      maxY: 377,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorTwo: {
    bounds: {
      minX: 1292,
      maxX: 1542,
      minY: 2702,
      maxY: 2736,
    },
    passingDirection: Direction.DOWN,
  },
  sectorThree: {
    bounds: {
      minX: 380,
      maxX: 671,
      minY: 1550,
      maxY: 1580,
    },
    passingDirection: Direction.UP,
  },
  name: "Redbull Ring MGP by Rodri",
  boxLine: {
    minX: -1000,
    maxX: 1,
    minY: 275,
    maxY: 355,
  },
  pitlaneStart: {
    minX: -1312,
    maxX: -1280,
    minY: 217,
    maxY: 340,
  },
  pitlaneEnd: {
    minX: 31,
    maxX: 63,
    minY: 215,
    maxY: 381,
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
    x: austria_json.redSpawnPoints[austria_json.redSpawnPoints.length - 1][0],
    y: austria_json.redSpawnPoints[austria_json.redSpawnPoints.length - 1][1],
  },
  BestTime: bestTimes.austria,
  MainColor: [0xd6001d, 0xd6001d, 0xffffff],
  AvatarColor: 0xffffff,
  Angle: 60,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
  TireDegradationPercentage: -5,
};

export const AUSTRIA: Circuit = {
  map: austria_raw,
  info: AUSTRIA_INFO,
};
