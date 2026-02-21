import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";
import { readFileSync } from "fs";
import { join } from "path";

const austin_crespo_raw = readFileSync(
  join(__dirname, "austin_crespo.hbs"),
  "utf-8",
);
const austin_crespo_json = JSON.parse(austin_crespo_raw);

const AUSTIN_CRESPO_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 320,
      maxX: 352,
      minY: 1697,
      maxY: 2057,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorOne: {
    bounds: {
      minX: 320,
      maxX: 352,
      minY: 1697,
      maxY: 2057,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorTwo: {
    bounds: {
      minX: 322,
      maxX: 556,
      minY: 278,
      maxY: 302,
    },
    passingDirection: Direction.UP,
  },
  sectorThree: {
    bounds: {
      minX: -478,
      maxX: -244,
      minY: 391,
      maxY: 423,
    },
    passingDirection: Direction.DOWN,
  },
  name: "Austin by Crespo",
  boxLine: {
    minX: -464,
    maxX: -464,
    minY: 1765,
    maxY: 1765,
  },
  pitlaneStart: {
    minX: -689,
    maxX: -518,
    minY: 2140,
    maxY: 2172,
  },
  pitlaneEnd: {
    minX: 243,
    maxX: 275,
    minY: 1910,
    maxY: 2060,
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
    x: austin_crespo_json.redSpawnPoints[
      austin_crespo_json.redSpawnPoints.length - 1
    ][0],
    y: austin_crespo_json.redSpawnPoints[
      austin_crespo_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.austin_crespo,
  MainColor: [0xb31942, 0xffffff, 0xb31942],
  AvatarColor: 0x0a3161,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  pitSpeed: 1,
};

export const AUSTIN_CRESPO: Circuit = {
  map: austin_crespo_raw,
  info: AUSTIN_CRESPO_INFO,
};
