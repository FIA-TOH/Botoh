

import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

const sepangPublic_raw = readFileSync(join(__dirname, "sepangPublic.hbs"), "utf-8");
const sepangPublic_json = JSON.parse(sepangPublic_raw);




const SEPANGPUBLIC_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 126,
      maxX: 158,
      minY: -258,
      maxY: 62,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Sepang F1 International Circuit - By Ximb - Public",
  sectorOne: {
   bounds: {
      minX: 126,
      maxX: 158,
      minY: -258,
      maxY: 62,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: -264,
      maxX: -232,
      minY: -2068,
      maxY: -1753,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: 618,
      maxX: 650,
      minY: 474,
      maxY: 733,
    },
    passingDirection: Direction.LEFT,
  },
  boxLine: {
    minX: 126,
    maxX: 1103,
    minY: -258,
    maxY: -189,
  },
  pitlaneStart: {
    minX: 1498,
    maxX: 1530,
    minY: -370,
    maxY: -185,
  },
  pitlaneEnd: {
     minX: -240,
    maxX: -208,
    minY: -250,
    maxY: -118,
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
    x: sepangPublic_json.redSpawnPoints[
      sepangPublic_json.redSpawnPoints.length - 1
    ][0],
    y: sepangPublic_json.redSpawnPoints[
      sepangPublic_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.sepangPublic,
  MainColor: [0xc70000, 0x000080, 0xffffff],
  AvatarColor: 0xffd800,
  Angle: 0,
  Limit: 5,
  Votes: 0,
CutDetectSegments: [
  {
    v0: [-2007, -132],
    v1: [-2250, -186],
    index: 226,
    penalty: 5,
  },
  {
    v0: [-2016, -388],
    v1: [-2796, -844],
    index: 228,
    penalty: 5,
  },
  {
    v0: [-2079, -1004],
    v1: [-2015, -753],
    index: 230,
    penalty: 5,
  },
  {
    v0: [-2079, -1004],
    v1: [-1980, -1293],
    index: 230,
    penalty: 5,
  },
  {
    v0: [-1980, -1293],
    v1: [-1637, -1562],
    index: 232,
    penalty: 5,
  },
  {
    v0: [192, -1878],
    v1: [122, -1774],
    index: 234,
    penalty: 5,
  },
  {
    v0: [450, -1521],
    v1: [487, -1361],
    index: 236,
    penalty: 5,
  },
  {
    v0: [1541, -873],
    v1: [1547, -374],
    index: 238,
    penalty: 5,
  },
  {
    v0: [2320, -391],
    v1: [2268, -518],
    index: 240,
    penalty: 5,
  },
  {
    v0: [2365, 74],
    v1: [2078, 227],
    index: 242,
    penalty: 5,
  },
  {
    v0: [2078, 227],
    v1: [2276, 412],
    index: 243,
    penalty: 5,
  },
  {
    v0: [-1798, 927],
    v1: [-1554, 1036],
    index: 245,
    penalty: 5,
  },
  {
    v0: [-1554, 1036],
    v1: [-1147, 969],
    index: 246,
    penalty: 5,
  },
  {
    v0: [-1147, 969],
    v1: [-992, 874],
    index: 247,
    penalty: 5,
  },
],
};

export const SEPANGPUBLIC: Circuit = {
  map: sepangPublic_raw,
  info: SEPANGPUBLIC_INFO,
};
