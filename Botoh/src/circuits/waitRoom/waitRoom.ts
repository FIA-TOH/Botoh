import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

const waitRoom_raw = readFileSync(join(__dirname, "waitRoom.hbs"), "utf-8");
const waitRoom_json = JSON.parse(waitRoom_raw);

const WAITROOM_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Wait Room - By Ximb",
  boxLine: {
    minX: 9999,
    maxX: 9999,
    minY: 9999,
    maxY: 9999,
  },
  pitlaneStart: {
    minX: 9999,
    maxX: 9999,
    minY: 9999,
    maxY: 9999,
  },
  pitlaneEnd: {
    minX: 9999,
    maxX: 9999,
    minY: 9999,
    maxY: 9999,
  },
  drsStart: [
    {
      minX: 9999,
      maxX: 9999,
      minY: 9999,
      maxY: 9999,
    },
  ],
  drsEnd: [
    {
      minX: 9999,
      maxX: 9999,
      minY: 9999,
      maxY: 9999,
    },
  ],
  checkpoints: [],
  lastPlace: {
    x: waitRoom_json.redSpawnPoints[waitRoom_json.redSpawnPoints.length - 1][0],
    y: waitRoom_json.redSpawnPoints[waitRoom_json.redSpawnPoints.length - 1][1],
  },
  BestTime: bestTimes.shanghai,
  MainColor: [0xd6001d],
  AvatarColor: 0xfae100,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
};

export const WAITROOM: Circuit = {
  map: waitRoom_raw,
  info: WAITROOM_INFO,
};
