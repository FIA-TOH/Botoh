import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

const balaton_raw = readFileSync(join(__dirname, "balaton.hbs"), "utf-8");
const balaton_json = JSON.parse(balaton_raw);

const BALATON_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -34,
      maxX: -2,
      minY: -409,
      maxY: 22,
    },
    passingDirection: Direction.LEFT,
  },
  sectorOne: {
    bounds: {
      minX: -34,
      maxX: -2,
      minY: -409,
      maxY: 22,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: 1029,
      maxX: 1061,
      minY: 133,
      maxY: 398,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: 583,
      maxX: 1084,
      minY: 3612,
      maxY: 3644,
    },
    passingDirection: Direction.RIGHT,
  },
  name: "Balaton Park by Rodri",
  boxLine: {
    minX: -2,
    maxX: 998,
    minY: -349,
    maxY: -269,
  },
  pitlaneStart: {
    minX: 1020,
    maxX: 1052,
    minY: -429,
    maxY: -197,
  },
  pitlaneEnd: {
    minX: -101,
    maxX: -69,
    minY: -414,
    maxY: -195,
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
    x: balaton_json.redSpawnPoints[balaton_json.redSpawnPoints.length - 1][0],
    y: balaton_json.redSpawnPoints[balaton_json.redSpawnPoints.length - 1][1],
  },
  BestTime: bestTimes.balaton,
  MainColor: [0xd6001d, 0xd6001d, 0xffffff],
  AvatarColor: 0xffffff,
  Angle: 60,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
  CutDetectSegments: [
    {
      v0: [1219.3473985896246, -542.9698850643176],
      v1: [1306.719738304806, -492.7422346524373],
      index: 225,
      penalty: 5,
    },
    {
      v0: [-666.1294032722159, -223.6650466749063],
      v1: [-735.3059518071891, -208.00352053326068],
      index: 226,
      penalty: 5,
    },
    {
      v0: [-589.594292105145, -600.698044286077],
      v1: [-513.5882459097303, -620.0869128529749],
      index: 227,
      penalty: 5,
    },
    {
      v0: [1242.5925925925928, 713.888888888889],
      v1: [1338.1669983644053, 760.9971252862675],
      index: 228,
      penalty: 2,
    },
    {
      v0: [1338.1669983644053, 760.9971252862675],
      v1: [1508.8042291321037, 380.12466290182056],
      index: 229,
      penalty: 5,
    },
    {
      v0: [918.9265724055225, 2549.784430241074],
      v1: [729.3629940776674, 2716.4719512759343],
      index: 234,
      penalty: 5,
    },
    {
      v0: [771.604938271605, 3052.126200274349],
      v1: [633.0527782131526, 3028.1805210378034],
      index: 235,
      penalty: 5,
    },
    {
      v0: [835.0007180888825, 3801.4787213084232],
      v1: [811.8998628257889, 3697.7023319615914],
      index: 236,
      penalty: 5,
    },
    {
      v0: [2124.5445172690133, 798.9293468672006],
      v1: [1883.603070507545, 649.115494101509],
      index: 237,
      penalty: 5,
    },
    {
      v0: [1883.603070507545, 649.115494101509],
      v1: [1843.2784636488343, 578.7037037037038],
      index: 238,
      penalty: 5,
    },
    {
      v0: [2166.132976191148, 312.38768743849266],
      v1: [2022.3646663122113, 239.16320000000005],
      index: 239,
      penalty: 5,
    },
    {
      v0: [633.0527782131526, 3028.1805210378034],
      v1: [154.3562690872552, 2943.794560449796],
      index: 240,
      penalty: 5,
    },
  ],
};

export const BALATON: Circuit = {
  map: balaton_raw,
  info: BALATON_INFO,
};
