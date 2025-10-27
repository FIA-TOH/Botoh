import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

const waitRoomQualy_raw = readFileSync(
  join(__dirname, "waitRoomQualy.hbs"),
  "utf-8"
);
const waitRoomQualy_json = JSON.parse(waitRoomQualy_raw);

const WAITROOMQUALY_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Wait Qualy Room - By Ximb",
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
    x: waitRoomQualy_json.redSpawnPoints[
      waitRoomQualy_json.redSpawnPoints.length - 1
    ][0],
    y: waitRoomQualy_json.redSpawnPoints[
      waitRoomQualy_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.shanghai,
  MainColor: [0xd6001d],
  AvatarColor: 0xfae100,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
};

export const WAITROOMQUALY: Circuit = {
  map: waitRoomQualy_raw,
  info: WAITROOMQUALY_INFO,
};
