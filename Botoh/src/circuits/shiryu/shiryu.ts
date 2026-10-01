import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, CircuitPhysics, Direction, SpecificDirection } from "../Circuit";

import { readFileSync } from "fs";
import { join } from "path";

const shiryu_raw = readFileSync(join(__dirname, "shiryu.hbs"), "utf-8");
const shiryu_json = JSON.parse(shiryu_raw);

const SHIRYU_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -512,
      maxX: -200,
      minY: 98,
      maxY: 130,
    },
    passingDirection: Direction.UP,
  },
  name: "Shiryu Dragao by Rodri",
  sectorOne: {
   bounds: {
      minX: -512,
      maxX: -200,
      minY: 98,
      maxY: 130,
    },
    passingDirection: Direction.UP,
  },
  sectorTwo: {
    bounds: {
      minX: -1584,
      maxX: -1306,
      minY: -813,
      maxY: -781,
    },
    passingDirection: Direction.UP,
  },
  sectorThree: {
    bounds: {
      minX: -2255,
      maxX: -2223,
      minY: 634,
      maxY: 825,
    },
    passingDirection: Direction.LEFT,
  },
  boxLine: {
    minX: -314,
    maxX: -314,
    minY: 945,
    maxY: 945,
  },
  pitlaneStart: {
     minX: -516,
    maxX: -420,
    minY: 229,
    maxY: 261,
  },
  pitlaneEnd: {
    minX: -684.6136539636644,
    maxX: -652.613654,
    minY: -539,
    maxY: -360.7942402692206,
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
    x: -330,
    y: 914,
  },
  BestTime: bestTimes.shiryu,
  MainColor: [0x2b6b7c, 0x2b6b7c, 0x2b6b7c],
  AvatarColor: 0xffcb00,
  Angle: 0,
  Limit: 5,
  Votes: 0,
  pitSpeed: 1,
  pitGap: 15,
  new_safetycar: false,
  physicsType: CircuitPhysics.CLASSIC,

  TireDegradationPercentage: 0,
 

};

export const SHIRYU: Circuit = {
  map: shiryu_raw,
  info: SHIRYU_INFO,
};
