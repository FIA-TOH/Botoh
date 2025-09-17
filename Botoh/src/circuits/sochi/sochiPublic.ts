

import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

const sochiPublic_raw = readFileSync(join(__dirname, "sochiPublic.hbs"), "utf-8");
const sochiPublic_json = JSON.parse(sochiPublic_raw);




const SOCHIPUBLIC_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 2001,
      maxX: 2033,
      minY: 1528,
      maxY: 1777,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Sochi Autodrom - By Ximb",
  sectorOne: {
    bounds: {
      minX: 2001,
      maxX: 2033,
      minY: 1528,
      maxY: 1777,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: -2446,
      maxX: -2416,
      minY: -674,
      maxY: -407,
    },
    passingDirection: Direction.LEFT,
  },
  sectorThree: {
    bounds: {
      minX: 867,
      maxX: 1201,
      minY: 407,
      maxY: 437,
    },
    passingDirection: Direction.DOWN,
  },
  boxLine: {
    minX: 2123,
    maxX: 3124,
    minY: 1454,
    maxY: 1537,
  },
  pitlaneStart: {
    minX: 3086,
    maxX: 3223,
    minY: 1025,
    maxY: 1055,
  },
  pitlaneEnd: {
    minX: 1328,
    maxX: 1358,
    minY: 1526,
    maxY: 1606,
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
    x: sochiPublic_json.redSpawnPoints[
      sochiPublic_json.redSpawnPoints.length - 1
    ][0],
    y: sochiPublic_json.redSpawnPoints[
      sochiPublic_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.sochi,
  MainColor: [0xffffff, 0x000080, 0xdd0000],
  AvatarColor: 0xffe817,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  CutDetectSegments: [
    {
      v0: [1113, 812],
      v1: [1265, 872],
      index: 170,
      penalty: 5,
    },
    {
      v0: [-225, 656],
      v1: [-55, 648],
      index: 193,
      penalty: 5,
    },
    {
      v0: [-292, 398],
      v1: [-483, 259],
      index: 194,
      penalty: 5,
    },
    {
      v0: [-1690, -150],
      v1: [-1715, -345],
      index: 195,
      penalty: 5,
    },
    {
      v0: [-2651, -840],
      v1: [-2612, -843],
      index: 196,
      penalty: 5,
    },
    {
      v0: [-1773, -1386],
      v1: [-1785, -1364],
      index: 197,
      penalty: 5,
    },
    {
      v0: [-1301, -974],
      v1: [-1284, -1009],
      index: 198,
      penalty: 5,
    },
    {
      v0: [-915, -1177],
      v1: [-934, -1211],
      index: 199,
      penalty: 5,
    },
    {
      v0: [-482, -1851],
      v1: [-479, -1824],
      index: 200,
      penalty: 5,
    },
    {
      v0: [2157, 978],
      v1: [2190, 1005],
      index: 202,
      penalty: 5,
    },
  ],
};

export const SOCHIPUBLIC: Circuit = {
  map: sochiPublic_raw,
  info: SOCHIPUBLIC_INFO,
};
