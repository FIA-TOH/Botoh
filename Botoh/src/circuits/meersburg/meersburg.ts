import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, CircuitPhysics, Direction } from "../Circuit";
import { readFileSync } from "fs";
import { join } from "path";

const meersburg_raw = readFileSync(join(__dirname, "meersburg.hbs"), "utf-8");
const meersburg_json = JSON.parse(meersburg_raw);

const MEERSBURG_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -100,
      maxX: -68,
      minY: 118.27473172048448,
      maxY: 401.034878894408,
    },
    passingDirection: Direction.LEFT,
  },
  sectorOne: {
    bounds: {
      minX: -100,
      maxX: -68,
      minY: 118.27473172048448,
      maxY: 401.034878894408,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: -582.1200000000001,
      maxX: -550.12,
      minY: -864.0000000000002,
      maxY: -669.6000000000001,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: 821.8800000000002,
      maxX: 853.88,
      minY: -352.0800000000001,
      maxY: -160.92000000000004,
    },
    passingDirection: Direction.RIGHT,
  },
  name: "Meersburg by Splinter",
  boxLine: {
    minX: 717.6759090546894,
    maxX: 717.6759090546894,
    minY: 152.27473172048448,
    maxY: 152.27473172048448,
  },
  pitlaneStart: {
    minX: 164.81481481481484,
    maxX: 714.8148148148149,
    minY: 387.96296296296305,
    maxY: 419.962963,
  },
  pitlaneEnd: {
    minX: -70.37037037037038,
    maxX: 125.92592592592594,
    minY: 421.29629629629636,
    maxY: 453.2962963,
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
    x: meersburg_json.redSpawnPoints[
      meersburg_json.redSpawnPoints.length - 1
    ][0],
    y: meersburg_json.redSpawnPoints[
      meersburg_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.meersburg,
  MainColor: [0x000001, 0xdd0000, 0xffce00],
  AvatarColor: 0xffffff,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  pitSpeed: 1,
  physicsType: CircuitPhysics.CLASSIC,
};

export const MEERSBURG: Circuit = {
  map: meersburg_raw,
  info: MEERSBURG_INFO,
};
