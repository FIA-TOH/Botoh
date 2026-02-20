import { readFileSync } from "fs";
import { join } from "path";

import { Circuit, CircuitInfo, Direction } from "../Circuit";
import { bestTimes } from "../bestTimes";

const yas_marina_nano_raw = readFileSync(
  join(__dirname, "yas_marina_nano.hbs"),
  "utf-8",
);
const yas_marina_nano_json = JSON.parse(yas_marina_nano_raw);

const YAS_MARINA_NANO_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -423,
      maxX: 94,
      minY: 250,
      maxY: 282,
    },
    passingDirection: Direction.DOWN,
  },
  sectorOne: {
    bounds: {
      minX: -423,
      maxX: 94,
      minY: 250,
      maxY: 282,
    },
    passingDirection: Direction.DOWN,
  },
  sectorTwo: {
    bounds: {
      minX: 1897,
      maxX: 1929,
      minY: 153,
      maxY: 780,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: -2591,
      maxX: -1967,
      minY: -82,
      maxY: -50,
    },
    passingDirection: Direction.DOWN,
  },
  name: "Yas Marina Circuit By Nanoseb",
  boxLine: {
    minX: -370,
    maxX: -310.01222400000006,
    minY: -378.128064,
    maxY: 180.271936,
  },
  pitlaneStart: {
    minX: -310.01222400000006,
    maxX: -234.01222400000003,
    minY: -517.728064,
    maxY: -485.728064,
  },
  pitlaneEnd: {
    minX: -376,
    maxX: -162,
    minY: 488,
    maxY: 520,
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
    x: yas_marina_nano_json.redSpawnPoints[
      yas_marina_nano_json.redSpawnPoints.length - 1
    ][0],
    y: yas_marina_nano_json.redSpawnPoints[
      yas_marina_nano_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.yasMarinaNano,
  MainColor: [0x047a3d, 0xffffff, 0x047a3d],
  AvatarColor: 0xf30505,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  TireDegradationPercentage: 75,
  CutDetectSegments: [
    {
      v0: [-27, 894],
      v1: [16, 852],
      index: 244,
      penalty: 5,
    },
    {
      v0: [1628.4748136501485, 111.03260921366453],
      v1: [1614, 485],
      index: 245,
      penalty: 5,
    },
    {
      v0: [2199, 482],
      v1: [2025, 209],
      index: 246,
      penalty: 5,
    },
    {
      v0: [2327, 445],
      v1: [2885, 717],
      index: 247,
      penalty: 5,
    },
    {
      v0: [2645, 314],
      v1: [2707, 219],
      index: 248,
      penalty: 5,
    },
    {
      v0: [-443, -1254],
      v1: [-337, -1076],
      index: 249,
      penalty: 5,
    },
    {
      v0: [-551, -1123],
      v1: [-725, -1247],
      index: 250,
      penalty: 5,
    },
    {
      v0: [-2309, 682],
      v1: [-2179, 798],
      index: 251,
      penalty: 5,
    },
    {
      v0: [-2149, 800],
      v1: [-1858, 737],
      index: 252,
      penalty: 5,
    },
    {
      v0: [-1301, -5],
      v1: [-1375, 41],
      index: 253,
      penalty: 5,
    },
    {
      v0: [-814, -480],
      v1: [-771, -439],
      index: 254,
      penalty: 5,
    },
  ],
};

export const YAS_MARINA_NANO: Circuit = {
  map: yas_marina_nano_raw,
  info: YAS_MARINA_NANO_INFO,
};
