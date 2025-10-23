import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

const hockenPublic_raw = readFileSync(
  join(__dirname, "hockenPublic.hbs"),
  "utf-8"
);
const hockenPublic_json = JSON.parse(hockenPublic_raw);

const HOCKENPUBLIC_INFO: CircuitInfo = {
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
    x: hockenPublic_json.redSpawnPoints[
      hockenPublic_json.redSpawnPoints.length - 1
    ][0],
    y: hockenPublic_json.redSpawnPoints[
      hockenPublic_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.hockenheimring,
  MainColor: [0x000001, 0xed2939, 0xfae042],
  AvatarColor: 0xffffff,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  TireDegradationPercentage: 0,
};

export const HOCKENPUBLIC: Circuit = {
  map: hockenPublic_raw,
  info: HOCKENPUBLIC_INFO,
};
