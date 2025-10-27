import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

import { readFileSync } from "fs";
import { join } from "path";

const nurburgringPublic_raw = readFileSync(
  join(__dirname, "nurburgringPublic.hbs"),
  "utf-8"
);
const nurburgringPublic_json = JSON.parse(nurburgringPublic_raw);

const NURBURGRINGPUBLIC_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -654,
      maxX: -624,
      minY: -194,
      maxY: 150,
    },
    passingDirection: Direction.RIGHT,
  },
  name: "Aramco Grosser Preis der Eifel - By Ximb",
  sectorOne: {
    bounds: {
      minX: -654,
      maxX: -624,
      minY: -194,
      maxY: 150,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorTwo: {
    bounds: {
      minX: 2516,
      maxX: 2548,
      minY: -319,
      maxY: -32,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: 1571,
      maxX: 1603,
      minY: 1082,
      maxY: 1483,
    },
    passingDirection: Direction.LEFT,
  },
  boxLine: {
    minX: -1213,
    maxX: -413,
    minY: 70,
    maxY: 150,
  },
  pitlaneStart: {
    minX: -1536,
    maxX: -1506,
    minY: 11,
    maxY: 82,
  },
  pitlaneEnd: {
    minX: 300,
    maxX: 330,
    minY: 11,
    maxY: 150,
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
    x: nurburgringPublic_json.redSpawnPoints[
      nurburgringPublic_json.redSpawnPoints.length - 1
    ][0],
    y: nurburgringPublic_json.redSpawnPoints[
      nurburgringPublic_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.nurburgring,
  MainColor: [0x000001, 0xdd0000, 0xffce00],
  AvatarColor: 0xffffff,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
  CutDetectSegments: [
    {
      v0: [1001.9376000000002, 498.0528000000001],
      v1: [1122.0768000000003, 482.8896000000001],
      index: 157,
      penalty: 5,
    },
    {
      v0: [1061.4240000000002, 622.8576000000002],
      v1: [1122.0768000000003, 482.8896000000001],
      index: 158,
      penalty: 5,
    },
    {
      v0: [2107.6752000000006, -55.98400000000001],
      v1: [2132.1792000000005, -244.94400000000005],
      index: 159,
      penalty: 5,
    },
    {
      v0: [2775.6960000000004, -407.73280000000005],
      v1: [2674.5552000000007, -445.5648000000001],
      index: 160,
      penalty: 5,
    },
    {
      v0: [2891.5056000000004, -1022.9328000000002],
      v1: [2988.3168000000005, -945.9504000000002],
      index: 161,
      penalty: 5,
    },
    {
      v0: [3673.8160000000007, -1039.4304000000002],
      v1: [3725.4816000000005, -1117.4112000000002],
      index: 162,
      penalty: 5,
    },
    {
      v0: [4496.472000000001, -856.1376000000001],
      v1: [4728.585600000001, -940.1184000000002],
      index: 163,
      penalty: 5,
    },
    {
      v0: [4499.971200000001, -818.8128000000002],
      v1: [4642.272000000001, -755.8272000000002],
      index: 164,
      penalty: 5,
    },
    {
      v0: [3633.3360000000007, -513.2160000000001],
      v1: [3787.300800000001, -370.9152000000001],
      index: 165,
      penalty: 5,
    },
    {
      v0: [3242.5920000000006, -359.2512000000001],
      v1: [3132.9504000000006, -419.90400000000005],
      index: 166,
      penalty: 5,
    },
    {
      v0: [2021.3712000000005, 484.0560000000001],
      v1: [2190.4992, 543.5424000000002],
      index: 167,
      penalty: 5,
    },
    {
      v0: [1953.7200000000005, 1063.7568],
      v1: [1744.9344000000003, 980.9424000000001],
      index: 168,
      penalty: 5,
    },
    {
      v0: [601.8624000000001, 1195.5600000000002],
      v1: [610.0272000000001, 1151.7360000000003],
      index: 169,
      penalty: 5,
    },
    {
      v0: [-818.8128000000002, 649.6848000000001],
      v1: [-720.8352000000001, 1154.7360000000003],
      index: 170,
      penalty: 5,
    },
    {
      v0: [-1103.4144000000001, 786.1536000000001],
      v1: [-1187.3952000000002, 279.93600000000004],
      index: 171,
      penalty: 5,
    },
    {
      v0: [-590, 113],
      v1: [-588, 148],
      index: 173,
      penalty: 5,
    },
    {
      v0: [1336, -78],
      v1: [1726, -169],
      index: 176,
      penalty: 5,
    },
    {
      v0: [-295, 707],
      v1: [-5, 708],
      index: 177,
      penalty: 5,
    },
    {
      v0: [-1624, 581],
      v1: [-2064, 717],
      index: 178,
      penalty: 5,
    },
    {
      v0: [1022.9328000000002, 442.0656000000001],
      v1: [1103.4144000000001, 437.4000000000001],
      index: 179,
      penalty: 5,
    },
  ],
};

export const NURBURGRINGPUBLIC: Circuit = {
  map: nurburgringPublic_raw,
  info: NURBURGRINGPUBLIC_INFO,
};
