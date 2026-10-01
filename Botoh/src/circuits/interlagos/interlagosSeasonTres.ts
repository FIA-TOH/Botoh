import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, CircuitPhysics, Direction, SpecificDirection } from "../Circuit";

import { readFileSync } from "fs";
import { join } from "path";

const interlagosSeasonTres_raw = readFileSync(join(__dirname, "interlagosSeasonTres.hbs"), "utf-8");
const interlagosSeasonTres_json = JSON.parse(interlagosSeasonTres_raw);

const INTERLAGOSSEASONTRES_INFO: CircuitInfo = {
 finishLine: {
    bounds: {
      minX: 773,
      maxX: 805,
      minY: 1017,
      maxY: 1336,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorOne: {
    bounds: {
      minX: 773,
      maxX: 805,
      minY: 1017,
      maxY: 1336,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorTwo: {
    bounds: {
      minX: 109,
      maxX: 141,
      minY: -1332,
      maxY: -833,
    },
    passingDirection: Direction.LEFT,
  },
  sectorThree: {
    bounds: {
      minX: -1680,
      maxX: -1167,
      minY: -379,
      maxY: -347,
    },
    passingDirection: Direction.UP,
  },
  name: "Autodromo Interlagos - By Ximb - NewGenV3",
  boxLine: {
    minX: -227,
    maxX: 773,
    minY: 1017,
    maxY: 1093,
  },
  pitlaneStart: {
    minX: -724,
    maxX: -692,
    minY: 1051,
    maxY: 1157,
  },
  pitlaneEnd: {
    minX: 1248,
    maxX: 1421,
    minY: 923,
    maxY: 955,
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
    x: -2070,
    y: 847,
  },
  BestTime: bestTimes.interlagosSeasonTres,
  MainColor: [0x10a100, 0xffff00, 0x10a100],
  AvatarColor: 0x00008c,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
  pitGap: 23,
  new_safetycar: true,
  physicsType: CircuitPhysics.WEC_NEWGEN,
  TireDegradationPercentage: 10,
  CutDetectSegments: [
    { index: 219220, penalty: 5, v0: [1732, 1010], v1: [1469, 1114] },
    { index: 221222, penalty: 5, v0: [1648, 746], v1: [1873, 739] },
    { index: 223224, penalty: 5, v0: [167, -1266], v1: [922, -802] },
    { index: 225226, penalty: 5, v0: [-345, -1196], v1: [-329, -1120] },
    { index: 227228, penalty: 5, v0: [-603, -627], v1: [-586, -404] },
    { index: 229230, penalty: 5, v0: [-941, 812], v1: [-514, 820] },
    { index: 231232, penalty: 5, v0: [-1792, 523], v1: [-1489, 522] },
    { index: 232233, penalty: 5, v0: [-1489, 522], v1: [-982, 126] },
    { index: 234235, penalty: 5, v0: [-1401, -32], v1: [-1541, 237] },
    { index: 235236, penalty: 5, v0: [-1541, 237], v1: [-2001, 305] },
    { index: 237238, penalty: 5, v0: [-1747, -661], v1: [-1758, -612] },
  ],
  CrashWallDetector: [
    { index: "219-220", v0: [-1901, 948], v1: [-927, 1335], curvatura: 0 },
    { index: "220-221", v0: [-927, 1335], v1: [1818, 1335], curvatura: 0 },
    { index: "223-222", v0: [-1060, 1004], v1: [-309, 1011], curvatura: -24 },
    { index: "222-225", v0: [-309, 1011], v1: [71, 662], curvatura: -59.05223955705905 },
    { index: "224-225", v0: [-4, 357], v1: [71, 662], curvatura: 53.68451623577448 },
  ],

};

export const INTERLAGOSSEASONTRES: Circuit = {
  map: interlagosSeasonTres_raw,
  info: INTERLAGOSSEASONTRES_INFO,
};
