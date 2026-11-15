import { readFileSync } from "fs";
import { join } from "path";

import { Circuit, CircuitInfo, CircuitPhysics, Direction } from "../Circuit";
import { bestTimes } from "../bestTimes";
import { DAYTONA_BANKING } from "./daytonaBanking";

const daytohnawecnight_raw = readFileSync(join(__dirname, "daytohnawecnight.hbs"), "utf-8");
const daytohnawecnight_json = JSON.parse(daytohnawecnight_raw);

const DAYTOHNAWECNIGHT_INFO: CircuitInfo = {
  bankingZones: DAYTONA_BANKING,
  hasDayNightCycle: false,
  finishLine: {
    bounds: {
      minX: 0,
      maxX: 32,
      minY: -460,
      maxY: 525,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorOne: {
    bounds: {
      minX: 0,
      maxX: 32,
      minY: -460,
      maxY: 525,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorTwo: {
    bounds: {
    minX: 870,
      maxX: 902,
      minY: -2144,
      maxY: -1564,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: 694,
      maxX: 726,
      minY: -3278,
      maxY: -3085,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Daytohna 24hs Night by Rodri&Samusca&Ximb",
  boxLine: {
    minX: -1012,
    maxX: -7,
    minY: -360.54510706389584,
    maxY: -252,
  },
  pitlaneStart: {
    minX: -1513,
    maxX: -1481,
    minY: -263,
    maxY: -138,
  },
  pitlaneEnd: {
    minX: 1078,
    maxX: 1110,
    minY: -257,
    maxY: -133,
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
    x: 1832,
    y: 3363,
  },
  BestTime: bestTimes.daytohnawecnight,
  MainColor: [0xb31942, 0xffffff, 0xb31942],
  AvatarColor: 0x0a3161,
  Angle: 90,
  Limit: 4,
  Votes: 0,
  pitSpeed: 0.97,
  TireDegradationPercentage: 0,
  pitGap: 14,
  new_safetycar: false,
  physicsType: CircuitPhysics.WEC_NEWGEN,
CrashWallDetector: [
  {
    index: "0-1",
    v0: [-2876 , -3263],
    v1: [2876 , -3263],
    curvatura: 0,
  },
],
CutDetectSegments: [
  { v0: [2107, -655], v1: [1931, -406], index: 159, penalty: 5 },
  { v0: [1615, -863], v1: [1903, -1514], index: 160, penalty: 5 },
  { v0: [1320, -904], v1: [1293, -850], index: 161, penalty: 5 },
  { v0: [-206, -1333], v1: [1903, -1514], index: 162, penalty: 5 },
  { v0: [-107, -1149], v1: [-93, -1510], index: 163, penalty: 5 },
  { v0: [1709, -1800], v1: [2122, -1889], index: 164, penalty: 5 },
  { v0: [2122, -1889], v1: [2607, -2128], index: 165, penalty: 5 },
  { v0: [3215, -2238], v1: [2215, -1373], index: 166, penalty: 5 },
  { v0: [3149, -2268], v1: [3255, -2177], index: 167, penalty: 5 },
  { v0: [2815, -1106], v1: [2923, -1489], index: 168, penalty: 5 },
  { v0: [2815, -1106], v1: [3394, -1212], index: 169, penalty: 5 },
  { v0: [-1104, -2942], v1: [-1391, -2948], index: 170, penalty: 5 },
  { v0: [-1649, -2904], v1: [-1420, -2945], index: 171, penalty: 5 },
  { v0: [-2025, -3046], v1: [-2199, -2630], index: 172, penalty: 5 },
  { v0: [-1856, -2965], v1: [-2193, -2629], index: 173, penalty: 5 },
],
};

export const DAYTOHNAWECNIGHT: Circuit = {
  map: daytohnawecnight_raw,
  info: DAYTOHNAWECNIGHT_INFO,
};
