import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

const las_vegas_raw = readFileSync(join(__dirname, "las_vegas.hbs"), "utf-8");
const las_vegas_json = JSON.parse(las_vegas_raw);

const LAS_VEGAS_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 2861,
      maxX: 3288,
      minY: 293,
      maxY: 325,
    },
    passingDirection: Direction.UP,
  },
  sectorOne: {
    bounds: {
      minX: 2861,
      maxX: 3288,
      minY: 293,
      maxY: 325,
    },
    passingDirection: Direction.UP,
  },
  sectorTwo: {
    bounds: {
      minX: 317,
      maxX: 685,
      minY: -1718,
      maxY: -1686,
    },
    passingDirection: Direction.UP,
  },
  sectorThree: {
    bounds: {
      minX: -2954,
      maxX: -2736,
      minY: -2143,
      maxY: -2111,
    },
    passingDirection: Direction.DOWN,
  },
  name: "Las Vegas Strip Circuit - By Ximb",
  boxLine: {
    minX: 2873,
    maxX: 2968,
    minY: -244,
    maxY: 756,
  },
  pitlaneStart: {
    minX: 2873,
    maxX: 3050,
    minY: 834,
    maxY: 866,
  },
  pitlaneEnd: {
    minX: 2873,
    maxX: 3050,
    minY: -355,
    maxY: -323,
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
    x: las_vegas_json.redSpawnPoints[
      las_vegas_json.redSpawnPoints.length - 1
    ][0],
    y: las_vegas_json.redSpawnPoints[
      las_vegas_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.las_vegas,
  MainColor: [0xdaa4fc, 0xdaa4fc, 0xff57c1],
  AvatarColor: 0x050314,
  Angle: 60,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
  CutDetectSegments: [
    {
      v0: [2905, 961],
      v1: [2873, 866],
      index: 180,
      penalty: 5,
    },
    {
      v0: [3050, -596],
      v1: [2996, -668],
      index: 181,
      penalty: 5,
    },
    {
      v0: [2996, -668],
      v1: [2796, -631],
      index: 182,
      penalty: 5,
    },
    {
      v0: [352, -1430],
      v1: [428, -1426],
      index: 183,
      penalty: 5,
    },
    {
      v0: [596, -2521],
      v1: [597, -2426],
      index: 184,
      penalty: 5,
    },
    {
      v0: [373, -2466],
      v1: [229, -2542],
      index: 185,
      penalty: 5,
    },
    {
      v0: [373, -2466],
      v1: [235, -2415],
      index: 186,
      penalty: 5,
    },
    {
      v0: [-31, -2577],
      v1: [-9, -2614],
      index: 187,
      penalty: 5,
    },
    {
      v0: [-2748, -2413],
      v1: [-2706, -2384],
      index: 188,
      penalty: 5,
    },
    {
      v0: [563, 2542],
      v1: [530, 2511],
      index: 189,
      penalty: 5,
    },
  ],
};

export const LAS_VEGAS: Circuit = {
  map: las_vegas_raw,
  info: LAS_VEGAS_INFO,
};
