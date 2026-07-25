import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction, SpecificDirection } from "../Circuit";

const barcelonaSeasonTres_raw = readFileSync(join(__dirname, "barcelonaSeasonTres.hbs"), "utf-8");
const barcelonaSeasonTres_json = JSON.parse(barcelonaSeasonTres_raw);

const BARCELONASEASONTRES_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -83,
      maxX: -51,
      minY: 673,
      maxY: 988,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Circuit de Barcelona-Catalunya by Rodri - NewGenV3",
  sectorOne: {
    bounds: {
     minX: -83,
      maxX: -51,
      minY: 673,
      maxY: 988,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: -1274,
      maxX: -1242,
      minY: -998,
      maxY: -653,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: 841,
      maxX: 873,
      minY: -28,
      maxY: 302,
    },
    passingDirection: Direction.RIGHT,
  },
  boxLine: {
    minX: -83,
    maxX: 1020,
    minY: 673,
    maxY: 753,
  },
  pitlaneStart: {
    minX: 1622,
    maxX: 1654,
    minY: 712,
    maxY: 826,
  },
  pitlaneEnd: {
    minX: -632,
    maxX: -600,
    minY: 655,
    maxY: 826,
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
    x: 1050,
    y: 723,
  },
  BestTime: bestTimes.barcelonaSeasonTres,
  MainColor: [0xc60b1e, 0xffc400, 0xc60b1e],
  AvatarColor: 0xffffff,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  TireDegradationPercentage: 0,
  pitSpeed: 0.97,
  pitGap: 17,
  CutDetectSegments: [
  { v0: [-1724, 796], v1: [-1675, 791], index: 223, penalty: 5 },
  { v0: [-1813, 508], v1: [-1890, 536], index: 225, penalty: 5 },
  { v0: [-2269, -254], v1: [-2074, -504], index: 227, penalty: 5 },
  { v0: [-2269, -254], v1: [-2263, 23], index: 227, penalty: 5 },
  { v0: [-2263, 23], v1: [-2052, 217], index: 229, penalty: 5 },
  { v0: [-1013, -722], v1: [-1079, -677], index: 231, penalty: 5 },
  { v0: [-1205, -326], v1: [-1460, -287], index: 233, penalty: 5 },
  { v0: [-1848, -187], v1: [-1832, -132], index: 235, penalty: 5 },
  { v0: [-1377, 147], v1: [-1377, 129], index: 237, penalty: 5 },
  { v0: [-1874, 83], v1: [-1728, 177], index: 239, penalty: 5 },
  { v0: [-758, 171], v1: [-749, 179], index: 241, penalty: 5 },
  { v0: [-695, -64], v1: [-663, -62], index: 243, penalty: 5 },
  { v0: [-505, -387], v1: [-229, -426], index: 245, penalty: 5 },
  { v0: [-373, -446], v1: [-360, -377], index: 247, penalty: 5 },
  { v0: [125, -442], v1: [258, -356], index: 249, penalty: 5 },
  { v0: [1186, 198], v1: [1228, 238], index: 251, penalty: 5 },
  { v0: [1139, -96], v1: [1069, -148], index: 253, penalty: 5 },
  { v0: [1099, -124], v1: [1081, -101], index: 255, penalty: 5 },
  { v0: [1511, -382], v1: [1463, -358], index: 257, penalty: 5 },
  { v0: [1682, 54], v1: [1736, -16], index: 259, penalty: 5 },
  { v0: [1831, 187], v1: [1817, 218], index: 261, penalty: 5 },
  { v0: [-406, -763], v1: [-404, -747], index: 223, penalty: 5 },
  { v0: [383, -770], v1: [403, -763], index: 225, penalty: 5 },
  { v0: [1796, -482], v1: [1768, -472], index: 227, penalty: 5 },
  { v0: [-2087, -323], v1: [-2077, -315], index: 229, penalty: 5 },
],

CrashWallDetector: [
  {
    index: "52-53",
    v0: [2217, 987],
    v1: [-2192.5300868665117, 987],
    curvatura: 0,
  },
  {
    index: "85-86",
    v0: [-1361.4631264869972, 362.0501989755936],
    v1: [-383, 371.1426092586113],
    curvatura: 0,
  },
  {
    index: "90-91",
    v0: [-23.456384722993107, -293.66978472538904],
    v1: [1381.8023103592866, 602.3959997616944],
    curvatura: 0,
  },
],

DirectionChangerDetector: [
  {
    v0: [-1554, 817],
    v1: [-1553, 1006],
    index: "000001",
    direction: SpecificDirection.LEFT,
    force: 0.7,
    sector: 1,
  },
  {
    v0: [-1916, 584],
    v1: [-1625, 722],
    index: "000002",
    direction: SpecificDirection.RIGHTUP,
    force: 0.5,
    sector: 1,
  },
  {
    v0: [-1219, -977],
    v1: [-1150, -680],
    index: "000002",
    direction: SpecificDirection.RIGHT,
    force: 0.6,
    sector: 1,
  },
  {
    v0: [-1781, -163],
    v1: [-1654, -394],
    index: "000002",
    direction: SpecificDirection.LEFTUP,
    force: 0.6,
    sector: 2,
  },
  {
    v0: [-813, 180],
    v1: [-811, 381],
    index: "000002",
    direction: SpecificDirection.RIGHT,
    force: 0.5,
    sector: 2,
  },
  {
    v0: [-733, -413],
    v1: [-510, -292],
    index: "000002",
    direction: SpecificDirection.UP,
    force: 0.5,
    sector: 2,
  },
  {
    v0: [1090, 164],
    v1: [971, 347],
    index: "000002",
    direction: SpecificDirection.RIGHTDOWN,
    force: 0.6,
    sector: 3,
  },
  {
    v0: [912, -368],
    v1: [881, -106],
    index: "000002",
    direction: SpecificDirection.LEFT,
    force: 0.5,
    sector: 3,
  },
  {
    v0: [1395, -366],
    v1: [1456, -718],
    index: "000002",
    direction: SpecificDirection.RIGHT,
    force: 0.5,
    sector: 3,
  },
  {
    v0: [1497, -31],
    v1: [1756, -27],
    index: "000002",
    direction: SpecificDirection.DOWN,
    force: 0.4,
    sector: 3,
  },
  {
    v0: [1723, -65],
    v1: [1765, 253],
    index: "000002",
    direction: SpecificDirection.RIGHT,
    force: 0.4,
    sector: 3,
  },
],
};

export const BARCELONASEASONTRES: Circuit = {
  map: barcelonaSeasonTres_raw,
  info: BARCELONASEASONTRES_INFO,
};
