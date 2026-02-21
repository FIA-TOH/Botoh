import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";
import { readFileSync } from "fs";
import { join } from "path";

const rivadavia_raw = readFileSync(join(__dirname, "rivadavia.hbs"), "utf-8");
const rivadavia_json = JSON.parse(rivadavia_raw);

const RIVADAVIA_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 400,
      maxX: 432,
      minY: 785,
      maxY: 1485.314366275585,
    },
    passingDirection: Direction.LEFT,
  },
  sectorOne: {
    bounds: {
      minX: 400,
      maxX: 432,
      minY: 785,
      maxY: 1485.314366275585,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: 592,
      maxX: 624,
      minY: 156,
      maxY: 285,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: 1075,
      maxX: 1107,
      minY: -258,
      maxY: -18,
    },
    passingDirection: Direction.RIGHT,
  },
  name: "Callejero de Parque Rivadavia by Peter",
  boxLine: {
    minX: 1254,
    maxX: 1254,
    minY: 885,
    maxY: 885,
  },
  pitlaneStart: {
    minX: 705,
    maxX: 993,
    minY: 1089,
    maxY: 1121,
  },
  pitlaneEnd: {
    minX: 535,
    maxX: 567,
    minY: 1232,
    maxY: 1515,
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
    x: rivadavia_json.redSpawnPoints[
      rivadavia_json.redSpawnPoints.length - 1
    ][0],
    y: rivadavia_json.redSpawnPoints[
      rivadavia_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.rivadavia,
  MainColor: [0x3f7efc],
  AvatarColor: 0xffdc96,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  pitSpeed: 1,
};

export const RIVADAVIA: Circuit = {
  map: rivadavia_raw,
  info: RIVADAVIA_INFO,
};
