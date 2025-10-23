import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

const istanbulPublic_raw = readFileSync(
  join(__dirname, "istanbulPublic.hbs"),
  "utf-8"
);
const istanbulPublic_json = JSON.parse(istanbulPublic_raw);

const ISTANBULPUBLIC_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -100,
      maxX: -84,
      minY: -95,
      maxY: 269,
    },
    passingDirection: Direction.RIGHT,
  },
  name: "İstanbul Park - By Ximb",
  boxLine: {
    minX: -1101,
    maxX: -101,
    minY: -95,
    maxY: 6,
  },
  pitlaneStart: {
    minX: -1198,
    maxX: -1168,
    minY: -32,
    maxY: 70,
  },
  pitlaneEnd: {
    minX: 251,
    maxX: 281,
    minY: -6,
    maxY: 70,
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
    x: istanbulPublic_json.redSpawnPoints[
      istanbulPublic_json.redSpawnPoints.length - 1
    ][0],
    y: istanbulPublic_json.redSpawnPoints[
      istanbulPublic_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.istanbul,
  MainColor: [0xe30a17],
  AvatarColor: 0xfff0f0,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  TireDegradationPercentage: 20,
};

export const ISTANBULPUBLIC: Circuit = {
  map: istanbulPublic_raw,
  info: ISTANBULPUBLIC_INFO,
};
