import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, CircuitPhysics, Direction, SpecificDirection } from "../Circuit";

import { readFileSync } from "fs";
import { join } from "path";

const waitRoomEvent_raw = readFileSync(join(__dirname, "waitRoomEvent.hbs"), "utf-8");
const waitRoomEvent_json = JSON.parse(waitRoomEvent_raw);

const WAITROOMEVENT_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 262,
      maxX: 294,
      minY: 110,
      maxY: 394,
    },
    passingDirection: Direction.RIGHT,
  },
  name: "Wait Room - By Ximb - Event",
  sectorOne: {
    bounds: {
    minX: 262,
      maxX: 294,
      minY: 110,
      maxY: 394,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorTwo: {
    bounds: {
      minX: 20,
      maxX: 52,
      minY: -401,
      maxY: -122,
    },
    passingDirection: Direction.LEFT,
  },
  sectorThree: {
    bounds: {
      minX: -1004,
      maxX: -484,
      minY: 20,
      maxY: 52,
    },
    passingDirection: Direction.DOWN,
  },
  boxLine: {
    minX: -475,
    maxX: -475,
    minY: 250,
    maxY: 250,
  },
  pitlaneStart: {
   minX: 0,
    maxX: 0,
    minY: 0,
    maxY: 0,
  },
  pitlaneEnd: {
    minX: 0,
    maxX: 0,
    minY: 0,
    maxY: 0,
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
    x: -475,
    y: 250,
  },
  BestTime: bestTimes.waitRoomEvent,
  MainColor: [0xffffff, 0xffffff, 0xffffff],
  AvatarColor: 0xed1839,
  Angle: 0,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.100,
  pitGap: 100,
  new_safetycar: false,
  physicsType: CircuitPhysics.WEC_NEWGEN,
  TireDegradationPercentage: 0,
  

};

export const WAITROOMEVENT: Circuit = {
  map: waitRoomEvent_raw,
  info: WAITROOMEVENT_INFO,
};
