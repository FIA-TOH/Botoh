

import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, CircuitPhysics, Direction, SpecificDirection } from "../Circuit";

const sepangSeasonTres_raw = readFileSync(join(__dirname, "sepangSeasonTres.hbs"), "utf-8");
const sepangSeasonTres_json = JSON.parse(sepangSeasonTres_raw);




const SEPANGSEASONTRES_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 126,
      maxX: 158,
      minY: -258,
      maxY: 62,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Sepang F1 International Circuit - By Ximb - NewgenV3",
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
    x: 1149,
    y: -231,
  },
  BestTime: bestTimes.sepangSeasonTres,
  MainColor: [0xc70000, 0x000080, 0xffffff],
  AvatarColor: 0xffd800,
  Angle: 0,
  Limit: 5,
  Votes: 0,
  TireDegradationPercentage: 25,
  pitGap: 16,
  new_safetycar: true,

  physicsType: CircuitPhysics.WEC_NEWGEN,
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
CrashWallDetector: [
  { index: "249-250", v0: [1671, -118], v1: [-254, -118], curvatura: 0 },
  { index: "251-252", v0: [-1542, -1607], v1: [-124, -1838], curvatura: 0 },
  { index: "253-254", v0: [-1696, -1781], v1: [226, -2111], curvatura: 0 },
  { index: "177-255", v0: [466, -1076], v1: [526, -1357], curvatura: 0 },
  { index: "256-257", v0: [2521, 639], v1: [395, 706], curvatura: 0 },
  { index: "258-259", v0: [1910, 437], v1: [384, 506], curvatura: 0 },
  { index: "260-261", v0: [374, 779], v1: [711, 893], curvatura: 0 },
  { index: "262-263", v0: [507, 1843], v1: [-211, 796], curvatura: 0 },
  { index: "121-122", v0: [-2595, 497], v1: [1498, 112], curvatura: 0 },
  { index: "170-137", v0: [-1984, 665], v1: [-403, 516], curvatura: 0 },
],
};

export const SEPANGSEASONTRES: Circuit = {
  map: sepangSeasonTres_raw,
  info: SEPANGSEASONTRES_INFO,
};
