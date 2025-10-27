import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

const miami_raw = readFileSync(join(__dirname, "miami.hbs"), "utf-8");
const miami_json = JSON.parse(miami_raw);

const MIAMI_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 1,
      maxX: 33,
      minY: -13,
      maxY: 344,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorOne: {
    bounds: {
      minX: 1,
      maxX: 33,
      minY: -13,
      maxY: 344,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorTwo: {
    bounds: {
      minX: -1412,
      maxX: -1380,
      minY: 1868,
      maxY: 2081,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: 1296,
      maxX: 1328,
      minY: -1585,
      maxY: -1336,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Miami by Rodri",
  boxLine: {
    minX: -900,
    maxX: 1,
    minY: 265,
    maxY: 344,
  },
  pitlaneStart: {
    minX: -1429,
    maxX: -1397,
    minY: 620,
    maxY: 796,
  },
  pitlaneEnd: {
    minX: 132,
    maxX: 164,
    minY: 188,
    maxY: 307,
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
    x: miami_json.redSpawnPoints[miami_json.redSpawnPoints.length - 1][0],
    y: miami_json.redSpawnPoints[miami_json.redSpawnPoints.length - 1][1],
  },
  BestTime: bestTimes.miami,
  MainColor: [0xd6001d, 0xd6001d, 0xffffff],
  AvatarColor: 0xffffff,
  Angle: 60,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
};

export const MIAMI: Circuit = {
  map: miami_raw,
  info: MIAMI_INFO,
};
