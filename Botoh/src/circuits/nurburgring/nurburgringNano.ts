import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

import { readFileSync } from "fs";
import { join } from "path";

const nurburgringNano_raw = readFileSync(
  join(__dirname, "nurburgringNano.hbs"),
  "utf-8"
);
const nurburgringNano_json = JSON.parse(nurburgringNano_raw);





const NURBURGRINGNANO_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -43,
      maxX: -11,
      minY: -131,
      maxY: 183,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Nurburgring GP By Nanoseb",
  boxLine: {
    minX: -495,
    maxX: 605,
    minY: -130,
    maxY: -75,
  },
  pitlaneStart: {
    minX: 680,
    maxX: 709,
    minY: -75,
    maxY: -20,
  },
  pitlaneEnd: {
    minX: -850,
    maxX: -820,
    minY: -75,
    maxY: -20,
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
    x: nurburgringNano_json.redSpawnPoints[
      nurburgringNano_json.redSpawnPoints.length - 1
    ][0],
    y: nurburgringNano_json.redSpawnPoints[
      nurburgringNano_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.nurburgringNano,
  MainColor: [0x000001, 0xdd0000, 0xffce00],
  AvatarColor: 0xffffff,
  Angle: 90,
  Limit: 5,
  Votes: 0,
};

export const NURBURGRINGNANO: Circuit = {
  map: nurburgringNano_raw,
  info: NURBURGRINGNANO_INFO,
};
