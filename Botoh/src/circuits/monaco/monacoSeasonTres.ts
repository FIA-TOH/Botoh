import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, CircuitPhysics, Direction, SpecificDirection } from "../Circuit";

import { readFileSync } from "fs";
import { join } from "path";

const monacoSeasonTres_raw = readFileSync(join(__dirname, "monacoSeasonTres.hbs"), "utf-8");

const MONACOSEASONTRES_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 612,
      maxX: 644,
      minY: 1387,
      maxY: 1659,
    },
    passingDirection: Direction.LEFT,
  },
  sectorOne: {
     bounds: {
      minX: 612,
      maxX: 644,
      minY: 1387,
      maxY: 1659,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: -1861,
      maxX: -1356,
      minY: -691,
      maxY: -659,
    },
    passingDirection: Direction.UP,
  },
  sectorThree: {
    bounds: {
      minX: -31,
      maxX: 1,
      minY: 1136,
      maxY: 1350,
    },
    passingDirection: Direction.RIGHT,
  },
  name: "Circuit de Monaco - By Ximb - NewgenV3",
  boxLine: {
    minX: 644,
    maxX: 1494,
    minY: 1325,
    maxY: 1459,
  },
  pitlaneStart: {
    minX: 1785,
    maxX: 1817,
    minY: 1167,
    maxY: 1386,
  },
  pitlaneEnd: {
    minX: 215,
    maxX: 247,
    minY: 1438,
    maxY: 1496,
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
    x: 1522,
    y: 1370,
  },
  BestTime: bestTimes.monacoSeasonTres,
  MainColor: [0xd6001d, 0xd6001d, 0xffffff],
  AvatarColor: 0xffffff,
  Angle: 60,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
  TireDegradationPercentage: -50,
  physicsType: CircuitPhysics.WEC_NEWGEN,
  pitGap: 21,
  new_safetycar: true,
  CutDetectSegments: [
    { v0: [-557, 1217], v1: [-501, 1219], index: 233, penalty: 5 },
    { v0: [-1624, -621], v1: [-1692, -583], index: 235, penalty: 5 },
    { v0: [-140, 370], v1: [-143, 437], index: 237, penalty: 5 },
    { v0: [-143, 437], v1: [-252, 477], index: 238, penalty: 5 },
    { v0: [1005, 1223], v1: [1043, 1175], index: 240, penalty: 5 },
    {
      v0: [-347, 1425],
      v1: [-316, 1369],
      index: 242,
      penalty: 5,
      isLeavingPit: true,
    },
  ],
CrashWallDetector: [
  { index: "12-13", v0: [1908.5720164609052, 1605.2688614540466], v1: [1916, 946], curvatura: -25.358986364131 },
  { index: "17-18", v0: [1873, 903], v1: [1651, 905], curvatura: -14.918284714694 },
  { index: "16-19", v0: [1644, 1041], v1: [1249, 1322], curvatura: 33.64890266689 },
  { index: "19-21", v0: [1249, 1322], v1: [1201, 1335], curvatura: 12.370509831165 },
  { index: "20-21", v0: [905, 1365], v1: [1201, 1335], curvatura: 0 },
  { index: "32-33", v0: [916, 1076], v1: [413, 1076], curvatura: 0 },
  { index: "42-1", v0: [192, 1632], v1: [1634.9053497942386, 1584.1399176954733], curvatura: -15.482437417437 },
  { index: "53-54", v0: [-575, 87], v1: [-548, -195], curvatura: 0 },
  { index: "69-70", v0: [177, 1335], v1: [-266, 1179], curvatura: 22.232884302078 },
  { index: "73-74", v0: [-286, 1144], v1: [-248, 607], curvatura: 0 },
  { index: "75-76", v0: [-115, 599], v1: [2, 512], curvatura: 0 },
  { index: "81-82", v0: [19, 483], v1: [23, 264], curvatura: 0 },
  { index: "87-88", v0: [-202, 203], v1: [-195, -127], curvatura: 0 },
  { index: "88-92", v0: [-195, -127], v1: [-255, -765], curvatura: -13.49923400628 },
  { index: "92-93", v0: [-255, -765], v1: [-390, -1324], curvatura: 0 },
  { index: "101-102", v0: [-447, -1423], v1: [-849, -1711], curvatura: -18.198525828635 },
  { index: "93-101", v0: [-390, -1324], v1: [-447, -1423], curvatura: -24.283032815819 },
  { index: "102-99", v0: [-849, -1711], v1: [-948, -1744], curvatura: -11.059745513546 },
  { index: "62-107", v0: [-1858, -904], v1: [-1446.4375857338819, -413.30727023319605], curvatura: 0 },
  { index: "2-42", v0: [-117, 1572], v1: [192, 1632], curvatura: -10 },
  { index: "172-168", v0: [-1289, -1400], v1: [-1226, -1254], curvatura: 200.89627358807465 },
  { index: "177-104", v0: [-1671, -1398], v1: [-1687, -1657], curvatura: 0 },
  { index: "100-182", v0: [-1500, -1840], v1: [-1320, -1809], curvatura: 0 },
  { index: "182-99", v0: [-1320, -1809], v1: [-948, -1744], curvatura: 0 },
  { index: "106-41", v0: [-502.08779149519887, 1373.1124828532238], v1: [-495, 1072], curvatura: 0 },
],

DirectionChangerDetector: [
  {
    v0: [-296, 1369],
    v1: [-292, 1574],
    index: "000000",
    direction: SpecificDirection.LEFT,
    force: 0.4,
    sector: 1,
  },
  {
    v0: [-561, -242],
    v1: [-410, -238],
    index: "000001",
    direction: SpecificDirection.UP,
    force: 0.5,
    sector: 1,
  },
  {
    v0: [-1207, -424],
    v1: [-1108, -309],
    index: "000002",
    direction: SpecificDirection.LEFTDOWN,
    force: 0.4,
    sector: 1,
  },
  {
    v0: [-1708, -918],
    v1: [-1903, -791],
    index: "000003",
    direction: SpecificDirection.LEFTUP,
    force: 0.6,
    sector: 2,
  },
  {
    v0: [-1244, -1270],
    v1: [-1248, -1131],
    index: "000004",
    direction: SpecificDirection.RIGHT,
    force: 0.5,
    sector: 2,
  },
  {
    v0: [-1440, -1438],
    v1: [-1350, -1327],
    index: "000005",
    direction: SpecificDirection.LEFTDOWN,
    force: 0.4,
    sector: 2,
  },
  {
    v0: [-1691, -1557],
    v1: [-1560, -1574],
    index: "000006",
    direction: SpecificDirection.UP,
    force: 0.5,
    sector: 2,
  },
  {
    v0: [-312, 95],
    v1: [-192, 102],
    index: "000007",
    direction: SpecificDirection.DOWN,
    force: 0.5,
    sector: 2,
  },
  {
    v0: [700, 1065],
    v1: [700, 1199],
    index: "000008",
    direction: SpecificDirection.RIGHT,
    force: 0.4,
    sector: 3,
  },
  {
    v0: [1809, 1460],
    v1: [1980, 1473],
    index: "000009",
    direction: SpecificDirection.DOWN,
    force: 0.5,
    sector: 3,
  },
],

};

export const MONACOSEASONTRES: Circuit = {
  map: monacoSeasonTres_raw,
  info: MONACOSEASONTRES_INFO,
};
