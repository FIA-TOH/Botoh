import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

const canadaPublic_raw = readFileSync(
  join(__dirname, "canadaPublic.hbs"),
  "utf-8"
);
const canadaPublic_json = JSON.parse(canadaPublic_raw);

const CANADAPUBLIC_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -2770,
      maxX: -2745,
      minY: 236,
      maxY: 660,
    },
    passingDirection: Direction.LEFT,
  },
  sectorOne: {
    bounds: {
      minX: -2770,
      maxX: -2745,
      minY: 236,
      maxY: 660,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: -924,
      maxX: -894,
      minY: -849,
      maxY: -576,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: 2801,
      maxX: 2830,
      minY: -4,
      maxY: 245,
    },
    passingDirection: Direction.RIGHT,
  },
  name: "Circuit Gilles Villeneuve - By Ximb",
  boxLine: {
    minX: -2720,
    maxX: -1885,
    minY: 548,
    maxY: 618,
  },
  pitlaneStart: {
    minX: -1264,
    maxX: -1234,
    minY: 436,
    maxY: 602,
  },
  pitlaneEnd: {
    minX: -3321,
    maxX: -3291,
    minY: 439,
    maxY: 740,
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
    x: canadaPublic_json.redSpawnPoints[
      canadaPublic_json.redSpawnPoints.length - 1
    ][0],
    y: canadaPublic_json.redSpawnPoints[
      canadaPublic_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.canada,
  MainColor: [0xd6001d, 0xffffff, 0xd6001d],
  AvatarColor: 0x000001,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
  CutDetectSegments: [
    {
      v0: [-612, 543],
      v1: [-499, 392],
      index: 113,
      penalty: 5,
    },
    {
      v0: [-2891, -496],
      v1: [-2868, -557],
      index: 114,
      penalty: 5,
    },
    {
      v0: [-812, -890],
      v1: [-745, -844],
      index: 115,
      penalty: 5,
    },
    {
      v0: [-3673, 547],
      v1: [-3602, 177],
      index: 158,
      penalty: 5,
    },
    {
      v0: [1215, -700],
      v1: [1323, -635],
      index: 179,
      penalty: 5,
    },
    {
      v0: [1370, -284],
      v1: [1507, -221],
      index: 180,
      penalty: 5,
    },
    {
      v0: [3271, 218],
      v1: [3284, 359],
      index: 185,
      penalty: 5,
    },
    {
      v0: [-3448, 585],
      v1: [-3417, 686],
      index: 190,
      penalty: 5,
    },
    {
      v0: [-3968, 454],
      v1: [-3803, -239],
      index: 203,
      penalty: 5,
    },
    {
      v0: [-3968, 454],
      v1: [-4116, 288],
      index: 204,
      penalty: 5,
    },
    {
      v0: [-4116, 288],
      v1: [-4073, 66],
      index: 205,
      penalty: 5,
    },
    {
      v0: [-249, -1245],
      v1: [-474, -1237],
      index: 206,
      penalty: 5,
    },
    {
      v0: [-474, -1237],
      v1: [-579, -1065],
      index: 207,
      penalty: 5,
    },
    {
      v0: [3271, 218],
      v1: [3214, 286],
      index: 208,
      penalty: 5,
    },
    {
      v0: [2591, 454],
      v1: [2494, 549],
      index: 209,
      penalty: 5,
    },
  ],
};

export const CANADAPUBLIC: Circuit = {
  map: canadaPublic_raw,
  info: CANADAPUBLIC_INFO,
};
