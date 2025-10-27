import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

const laguna_seca_raw = readFileSync(
  join(__dirname, "laguna_seca.hbs"),
  "utf-8"
);
const laguna_seca_json = JSON.parse(laguna_seca_raw);

const LAGUNA_SECA_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 100,
      maxX: 132,
      minY: 1675,
      maxY: 2080,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorOne: {
    bounds: {
      minX: 100,
      maxX: 132,
      minY: 1675,
      maxY: 2080,
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
      minX: -1446,
      maxX: -1414,
      minY: -615,
      maxY: -319,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Laguna Seca by Rodri",
  boxLine: {
    minX: -900,
    maxX: 100,
    minY: 1724,
    maxY: 1790,
  },
  pitlaneStart: {
    minX: -1172,
    maxX: -1140,
    minY: 1777,
    maxY: 1870,
  },
  pitlaneEnd: {
    minX: 755,
    maxX: 787,
    minY: 1660,
    maxY: 1780,
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
    x: laguna_seca_json.redSpawnPoints[
      laguna_seca_json.redSpawnPoints.length - 1
    ][0],
    y: laguna_seca_json.redSpawnPoints[
      laguna_seca_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.laguna_seca,
  MainColor: [0xd6001d, 0xd6001d, 0xffffff],
  AvatarColor: 0xffffff,
  Angle: 60,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
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

export const LAGUNA_SECA: Circuit = {
  map: laguna_seca_raw,
  info: LAGUNA_SECA_INFO,
};
