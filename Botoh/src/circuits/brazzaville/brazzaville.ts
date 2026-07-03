import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, CircuitPhysics, Direction } from "../Circuit";
import { readFileSync } from "fs";
import { join } from "path";

const brazzaville_raw = readFileSync(join(__dirname, "brazzaville.hbs"), "utf-8");
const brazzaville_json = JSON.parse(brazzaville_raw);

const BRAZZAVILLE_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -3,
      maxX: 7,
      minY: -320,
      maxY: -21,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorOne: {
    bounds: {
      minX: -3,
      maxX: 7,
      minY: -320,
      maxY: -21,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorTwo: {
    bounds: {
      minX: 1602,
      maxX: 1632,
      minY: -686,
      maxY: -583,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: -190,
      maxX: -160,
      minY: 262,
      maxY: 367,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Brazzaville",
  boxLine: {
    minX: -600,
    maxX: 0,
    minY: -320,
    maxY: -260,
  },
  pitlaneStart: {
    minX: -660,
    maxX: -630,
    minY: -260,
    maxY: -200,
  },
  pitlaneEnd: {
    minX: 30,
    maxX: 60,
    minY: -260,
    maxY: -200,
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
    x: brazzaville_json.redSpawnPoints[brazzaville_json.redSpawnPoints.length - 1][0],
    y: brazzaville_json.redSpawnPoints[brazzaville_json.redSpawnPoints.length - 1][1],
  },
  BestTime: bestTimes.brazzaville,
  MainColor: [0x27F538, 0xF5DD27, 0xF52727],
  AvatarColor: 0xffffff,
  Angle: 60,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
  physicsType: CircuitPhysics.CLASSIC,
};

export const BRAZZAVILLE: Circuit = {
  map: brazzaville_raw,
  info: BRAZZAVILLE_INFO,
};
