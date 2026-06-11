import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction, SpecificDirection } from "../Circuit";

const miamiSeasonTres_raw = readFileSync(join(__dirname, "miamiSeasonTres.hbs"), "utf-8");
const miamiSeasonTres_json = JSON.parse(miamiSeasonTres_raw);

const MIAMISEASONTRES_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 1,
      maxX: 33,
      minY: -13,
      maxY: 344,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorOne: {
    bounds: {
      minX: 1,
      maxX: 33,
      minY: -13,
      maxY: 344,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorTwo: {
    bounds: {
      minX: -1412,
      maxX: -1380,
      minY: 1868,
      maxY: 2081,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: 1296,
      maxX: 1328,
      minY: -1585,
      maxY: -1336,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Miami by Rodri - NewgenV3",
  boxLine: {
    minX: -900,
    maxX: 1,
    minY: 265,
    maxY: 344,
  },
  pitlaneStart: {
    minX: -1429,
    maxX: -965,
    minY: 600,
    maxY: 632,
  },
  pitlaneEnd: {
    minX: 132,
    maxX: 164,
    minY: 188,
    maxY: 307,
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
    x: miamiSeasonTres_json.redSpawnPoints[miamiSeasonTres_json.redSpawnPoints.length - 1][0],
    y: miamiSeasonTres_json.redSpawnPoints[miamiSeasonTres_json.redSpawnPoints.length - 1][1],
  },
  BestTime: bestTimes.miamiSeasonTres,
  MainColor: [0xd6001d, 0xd6001d, 0xffffff],
  AvatarColor: 0xffffff,
  Angle: 60,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.96,
  TireDegradationPercentage: 10,
  pitGap: 15,
  new_safetycar: true,


  CrashWallDetector: [
  { index: "133-134", v0: [-999.9959489886011, 13], v1: [888, 13], curvatura: 0 },
  { index: "138-139", v0: [-2068.5540828917997, 529.9182686379434], v1: [1508.0573780058817, -1463.214561553484], curvatura: 0 },
  { index: "139-140", v0: [1508.0573780058817, -1463.214561553484], v1: [1524.5967269636972, -1451.6619070772404], curvatura: 127.11754337804496 },
  { index: "140-141", v0: [1524.5967269636972, -1451.6619070772404], v1: [1428.8959952762455, -1217.2865724997791], curvatura: 0 },
  { index: "145-146", v0: [1644.4546379017575, -955.7999933371843], v1: [1565.643815389767, -882.3286829161534], curvatura: 72.75374422147091 },
  { index: "146-147", v0: [1565.643815389767, -882.3286829161534], v1: [1029.1493521067662, -888.1580681150803], curvatura: 0 },
  { index: "151-152", v0: [263.3326995532109, 1178.1054230241098], v1: [-782.5095007369277, 1623.9477617212544], curvatura: -29.858153461560658 },
  { index: "153-154", v0: [-1721.7894434390253, 2202.5945125852254], v1: [-1784.9087082559947, 2234.010307968948], curvatura: 110 },
  { index: "157-158", v0: [-638.3469071595192, 1233.9248029149014], v1: [141.16550217023484, 1136.2372965770212], curvatura: 0 },
  { index: "158-159", v0: [141.16550217023484, 1136.2372965770212], v1: [662.4283694195468, 944.0219588960986], curvatura: -17.9583939020688 },
  { index: "160-161", v0: [-1000, 190], v1: [350, 190], curvatura: 0 },
  { index: "161-162", v0: [350, 190], v1: [363.23786763672643, 215.67048028379622], curvatura: 117.036719987262 },
  { index: "166-167", v0: [-2609.5686965819164, 780], v1: [-1000, 777], curvatura: 0 },
  { index: "171-172", v0: [67.54443364910378, 679.2751306303555], v1: [395.2572159135188, 774.0164026359225], curvatura: 32.55635537943722 },
  { index: "175-176", v0: [-1036.621052699037, 1424.1424781905614], v1: [-1354.5032924112695, 1561.9778954426718], curvatura: 109.3555364648115 },
  { index: "182-183", v0: [261.0295318651961, 1336.5173341186926], v1: [1019.3665993829902, 921.7345837320938], curvatura: -45 },
  { index: "183-184", v0: [1019.3665993829902, 921.7345837320938], v1: [1431.1903366186752, 410.934105678033], curvatura: 0 },
  { index: "189-190", v0: [1663.9904715972839, -1741.1543608125542], v1: [-2625.218243476367, 648.381008281425], curvatura: 0 },
  { index: "172-191", v0: [395.2572159135188, 774.0164026359225], v1: [397.4186103364616, 860.9532074247995], curvatura: 90 },
  { index: "194-154", v0: [-1897.9248000000005, 1727.5860807680006], v1: [-1784.9087082559947, 2234.010307968948], curvatura: -91.00274534493393 },
  { index: "196-197", v0: [863.0209776236978, -425.91886649598496], v1: [1143.26756207228, -731.7861122076783], curvatura: 89.17491793263123 },
  { index: "195-196", v0: [1120.788990151301, -228.93580428924722], v1: [863.0209776236978, -425.91886649598496], curvatura: 89.24843265049459 },
  { index: "155-194", v0: [-1438.752324895214, 1724.101149244448], v1: [-1897.9248000000005, 1727.5860807680006], curvatura: -105.9820354325548 },
  { index: "217-218", v0: [-1505.64, 2075.2800000000007], v1: [-1573.7600000000004, 2150.4800000000005], curvatura: -78.70089599718575 },
  { index: "185-184", v0: [1953.5459969571255, -564.0308005879831], v1: [1431.1903366186752, 410.934105678033], curvatura: 16.360573822910926 },
  { index: "135-133", v0: [-1550.0437953635626, 428.1320752824014], v1: [-999.9959489886011, 13], curvatura: 68.38308681672697 },
],

DirectionChangerDetector: [
  {
    v0: [282, 192],
    v1: [279, 10],
    index: "000001",
    direction: SpecificDirection.RIGHT,
    force: 0.7,
    sector: 1
  },
  {
    v0: [379, 771],
    v1: [518, 622],
    index: "000002",
    direction: SpecificDirection.RIGHTDOWN,
    force: 0.5,
    sector: 1
  },
  {
    v0: [-1650, 1398],
    v1: [-1652, 1620],
    index: "000003",
    direction: SpecificDirection.LEFT,
    force: 0.5,
    sector: 1
  },
  {
    v0: [-1813, 2171],
    v1: [-2449, 2194],
    index: "000004",
    direction: SpecificDirection.DOWN,
    force: 0.5,
    sector: 1
  },
  {
    v0: [-1739, 2164],
    v1: [-1489, 2152],
    index: "000005",
    direction: SpecificDirection.UP,
    force: 0.4,
    sector: 1
  },
  {
    v0: [1445, -49],
    v1: [1774, -32],
    index: "000006",
    direction: SpecificDirection.RIGHTUP,
    force: 0.9,
    sector: 2
  },
  {
    v0: [1514, -895],
    v1: [1514, -715],
    index: "000007",
    direction: SpecificDirection.RIGHT,
    force: 0.4,
    sector: 2
  },
  {
    v0: [1617, -1080],
    v1: [1899, -1075],
    index: "000008",
    direction: SpecificDirection.UP,
    force: 0.5,
    sector: 2
  },
  {
    v0: [1491, -1396],
    v1: [1657, -1393],
    index: "000009",
    direction: SpecificDirection.UP,
    force: 0.4,
    sector: 2
  },
  {
    v0: [-2044, 307],
    v1: [-1945, 481],
    index: "000010",
    direction: SpecificDirection.LEFTDOWN,
    force: 0.9,
    sector: 3
  },
  
],
CutDetectSegments: [
  {
    v0: [1468, 44],
    v1: [1566, -142],
    index: 255,
    penalty: 5,
  },
  {
    v0: [1623, -1093],
    v1: [1656, -1121],
    index: 257,
    penalty: 5,
  },
  {
    v0: [1593, -1258],
    v1: [1646, -1357],
    index: 259,
    penalty: 5,
  },
],
};

export const MIAMISEASONTRES: Circuit = {
  map: miamiSeasonTres_raw,
  info: MIAMISEASONTRES_INFO,
};
