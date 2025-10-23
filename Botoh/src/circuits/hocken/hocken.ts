import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

const hocken_raw = readFileSync(join(__dirname, "hocken.hbs"), "utf-8");
const hocken_json = JSON.parse(hocken_raw);

const HOCKEN_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -4395,
      maxX: -3977,
      minY: 610,
      maxY: 640,
    },
    passingDirection: Direction.UP,
  },
  name: "Hockenheimring - By Ximb",
  boxLine: {
    minX: -4067,
    maxX: -3975,
    minY: 647,
    maxY: 1647,
  },
  pitlaneStart: {
    minX: -4144,
    maxX: -4067,
    minY: 2130,
    maxY: 2160,
  },
  pitlaneEnd: {
    minX: -4143,
    maxX: -4067,
    minY: -215,
    maxY: -185,
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
  lastPlace: {
    x: hocken_json.redSpawnPoints[hocken_json.redSpawnPoints.length - 1][0],
    y: hocken_json.redSpawnPoints[hocken_json.redSpawnPoints.length - 1][1],
  },
  BestTime: bestTimes.hockenheimring,
  MainColor: [0x000001, 0xed2939, 0xfae042],
  AvatarColor: 0xffffff,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  TireDegradationPercentage: 0,
};

export const HOCKEN: Circuit = {
  map: hocken_raw,
  info: HOCKEN_INFO,
};
