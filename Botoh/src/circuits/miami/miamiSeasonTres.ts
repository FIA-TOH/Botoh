import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

const miamiSeasonTres_raw = readFileSync(join(__dirname, "miamiSeasonTres.hbs"), "utf-8");
const miamiSeasonTres_json = JSON.parse(miamiSeasonTres_raw);

const MIAMISEASONTRES_INFO: CircuitInfo = {
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
  name: "Miami by Rodri - NewgenV3",
  boxLine: {
    minX: -900,
    maxX: 1,
    minY: 265,
    maxY: 344,
  },
  pitlaneStart: {
    minX: -1429,
    maxX: -965,
    minY: 632,
    maxY: 600,
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
    x: miamiSeasonTres_json.redSpawnPoints[miamiSeasonTres_json.redSpawnPoints.length - 1][0],
    y: miamiSeasonTres_json.redSpawnPoints[miamiSeasonTres_json.redSpawnPoints.length - 1][1],
  },
  BestTime: bestTimes.miamiSeasonTres,
  MainColor: [0xd6001d, 0xd6001d, 0xffffff],
  AvatarColor: 0xffffff,
  Angle: 60,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
};

export const MIAMISEASONTRES: Circuit = {
  map: miamiSeasonTres_raw,
  info: MIAMISEASONTRES_INFO,
};
