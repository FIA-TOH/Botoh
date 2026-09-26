import { readFileSync } from "fs";
import { join } from "path";

import { Circuit, CircuitInfo, CircuitPhysics, Direction } from "../Circuit";
import { bestTimes } from "../bestTimes";

const argentinaSeasonTres_raw = readFileSync(join(__dirname, "argentinaSeasonTres.hbs"), "utf-8");
const argentinaSeasonTres_json = JSON.parse(argentinaSeasonTres_raw);

const ARGENTINASEASONTRES_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 29,
      maxX: 55,
      minY: -1142,
      maxY: -799,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorOne: {
     bounds: {
      minX: 29,
      maxX: 55,
      minY: -1142,
      maxY: -799,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorTwo: {
    bounds: {
      minX: 1810,
      maxX: 1842,
      minY: 485,
      maxY: 798,
    },
    passingDirection: Direction.LEFT,
  },
  sectorThree: {
    bounds: {
      minX: -256,
      maxX: -224,
      minY: -70,
      maxY: 947985,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Autodromo Oscar Alfredo Galvez - By Ximb - NewGenV3",
  boxLine: {
    minX: -1067.5502576027643,
    maxX: 32.65831788922628,
    minY: -887.3589219523059,
    maxY: -799.9455910817555,
  },
  pitlaneStart: {
    minX: -1801,
    maxX: -1769,
    minY: -982,
    maxY: -838,
  },
  pitlaneEnd: {
    minX: 220,
    maxX: 252,
    minY: -966,
    maxY: -778,
  },
  drsStart: [
    {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
    },
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
    {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
    },
  ],
  checkpoints: [],
  lastPlace: {
    x: -2589,
    y: -1719,
  },
  BestTime: bestTimes.argentinaSeasonTres,
  MainColor: [0x6cace4, 0xffffff, 0x6cace4],
  AvatarColor: 0xffc300,
  Angle: 90,
  Limit: 4,
  Votes: 0,
  pitSpeed: 0.97,
  TireDegradationPercentage: 5,
  pitGap: 16,
  new_safetycar: true,
  physicsType: CircuitPhysics.WEC_NEWGEN,
CutDetectSegments: [
  { index: 220221, penalty: 5, v0: [1089, -930], v1: [1171, -934] },
  { index: 222223, penalty: 5, v0: [1210, -645], v1: [1189, -927] },
  { index: 224225, penalty: 5, v0: [816, -415], v1: [810, -579] },
  { index: 226193, penalty: 5, v0: [283, -267], v1: [362, -224] },
  { index: 227228, penalty: 5, v0: [813, 336], v1: [801, -72] },
  { index: 229230, penalty: 5, v0: [1236, 159], v1: [1396, 281] },
  { index: 231232, penalty: 5, v0: [1461, 897], v1: [1483, 926] },
  { index: 233234, penalty: 5, v0: [601, 1322], v1: [615, 1344] },
  { index: 235236, penalty: 5, v0: [-401, 1482], v1: [-380, 1383] },
  { index: 237238, penalty: 5, v0: [-928, 1308], v1: [-1042, 1376] },
  { index: 239240, penalty: 5, v0: [-1099, 1077], v1: [-1235, 1140] },
  { index: 241242, penalty: 5, v0: [-1279, 837], v1: [-1418, 888] },
  { index: 243244, penalty: 5, v0: [-1193, 540], v1: [-1153, 621] },
  { index: 245246, penalty: 5, v0: [-827, 756], v1: [-221, 488] },
  { index: 247248, penalty: 5, v0: [-638, 905], v1: [-797, 1110] },
  { index: 249246, penalty: 5, v0: [-403, 1115], v1: [-221, 488] },
  { index: 250246, penalty: 5, v0: [-218, 954], v1: [-221, 488] },
  { index: 246251, penalty: 5, v0: [-221, 488], v1: [97, 588] },
  { index: 252208, penalty: 5, v0: [-1024, -120], v1: [-884, 52] },
  { index: 253254, penalty: 5, v0: [-1186, 84], v1: [-1576, -25] },
  { index: 254255, penalty: 5, v0: [-1576, -25], v1: [-1598, 45] },
  { index: 254256, penalty: 5, v0: [-1576, -25], v1: [-1310, 189] },
  { index: 257258, penalty: 5, v0: [-2379, -1365], v1: [-2291, -1305] },
  { index: 258259, penalty: 5, v0: [-2291, -1305], v1: [-2274, -1413] },
  { index: 258260, penalty: 5, v0: [-2291, -1305], v1: [-2202, -1360] },
],

};

export const ARGENTINASEASONTRES: Circuit = {
  map: argentinaSeasonTres_raw,
  info: ARGENTINASEASONTRES_INFO,
};
