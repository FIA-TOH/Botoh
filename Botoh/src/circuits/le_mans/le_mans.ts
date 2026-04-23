import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, CircuitPhysics, Direction } from "../Circuit";

const le_mans_raw = readFileSync(
  join(__dirname, "le_mans.hbs"),
  "utf-8"
);
const le_mans_json = JSON.parse(le_mans_raw);

const LE_MANS_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 2,
      maxX: 34,
      minY: -380,
      maxY: -21,
    },
    passingDirection: Direction.LEFT,
  },
  sectorOne: {
    bounds: {
      minX: -1421,
      maxX: -1389,
      minY: -3037,
      maxY: -2881,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorTwo: {
    bounds: {
      minX: 1605,
      maxX: 1632,
      minY: -425,
      maxY: -218,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
   bounds: {
      minX: 6991,
      maxX: 7219,
      minY: -3159,
      maxY: -3127,
    },
    passingDirection: Direction.DOWN,
  },
  name: "Le Mans By Nanoseb Remake",
  boxLine: {
    minX: -705,
    maxX: 458,
    minY: -380,
    maxY: -320,
  },
  pitlaneStart: {
    minX: 542,
    maxX: 574,
    minY: -380,
    maxY: -235,
  },
  pitlaneEnd: {
    minX: -1000,
    maxX: -968,
    minY: -270,
    maxY: -183,
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
    x: le_mans_json.redSpawnPoints[
      le_mans_json.redSpawnPoints.length - 1
    ][0],
    y: le_mans_json.redSpawnPoints[
      le_mans_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.le_mans,
  MainColor: [0x0055a4, 0xffffff, 0xef4135],
    AvatarColor: 0x000001,
    Angle: 0,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
  physicsType: CircuitPhysics.FH_NEWGEN,
  CutDetectSegments: [
    {
      v0: [695.9964182729977, 1355.9839868659146],
      v1: [676.4996978515506, 1430.585880164949],
      index: 196,
      penalty: 5,
    },
    {
      v0: [1328.0580654123432, 872.0071897388424],
      v1: [1191.5421937712747, 1171.6963877457706],
      index: 197,
      penalty: 5,
    },
    {
      v0: [1699.688640202752, -903.6401012300832],
      v1: [1972.7089920000008, -716.7761280000003],
      index: 198,
      penalty: 5,
    },
    {
      v0: [1914.7622400000007, -1051.8595200000004],
      v1: [2251.8857455973116, -1072.0085788152408],
      index: 199,
      penalty: 5,
    },
    {
      v0: [996.4321920000004, -1887.0485760000008],
      v1: [977.6298240000004, -1814.0319360000005],
      index: 200,
      penalty: 5,
    },
    {
      v0: [-773.3232000000003, -1138.4064000000003],
      v1: [-867.8016000000002, -1234.0512000000003],
      index: 201,
      penalty: 5,
    },
    {
      v0: [-1071.6534524949393, 802.095953854154],
      v1: [-915.7407407407409, 791.6666666666667],
      index: 202,
      penalty: 5,
    },
    {
      v0: [-957.0253320906356, -878.3643309974185],
      v1: [-1037.538739013362, -965.3000050805264],
      index: 210,
      penalty: 5,
    },
    {
      v0: [499.1472806338563, 1490.885641031845],
      v1: [99.97308234547206, 415.76107261132825],
      index: 215,
      penalty: 5,
    },
    {
      v0: [244.88801280000013, 364.61104128000017],
      v1: [991.7964518400005, -205.4338329600001],
      index: 216,
      penalty: 5,
    },
  ],
};

export const LE_MANS: Circuit = {
  map: le_mans_raw,
  info: LE_MANS_INFO,
};
