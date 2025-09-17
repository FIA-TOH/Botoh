import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

const fuji_raw = readFileSync(join(__dirname, "fuji.hbs"), "utf-8");
const fuji_json = JSON.parse(fuji_raw);

const FUJI_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 400,
      maxX: 430,
      minY: -20,
      maxY: 400,
    },
    passingDirection: Direction.RIGHT,
  },
  name: "Fuji International - By Ximb",
  boxLine: {
    minX: -600,
    maxX: 400,
    minY: 293,
    maxY: 400,
  },
  pitlaneStart: {
    minX: -1588,
    maxX: -1558,
    minY: 202,
    maxY: 293,
  },
  pitlaneEnd: {
    minX: 1885,
    maxX: 1915,
    minY: 202,
    maxY: 293,
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
    x: fuji_json.redSpawnPoints[fuji_json.redSpawnPoints.length - 1][0],
    y: fuji_json.redSpawnPoints[fuji_json.redSpawnPoints.length - 1][1],
  },
  BestTime: bestTimes.fuji,
  MainColor: [0xffffff],
  AvatarColor: 0xbc002d,
  Angle: 90,
  Limit: 5,
  Votes: 0,
};

export const FUJI: Circuit = {
  map: fuji_raw,
  info: FUJI_INFO,
};
