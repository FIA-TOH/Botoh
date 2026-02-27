import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, CircuitPhysics, Direction } from "../Circuit";
import { readFileSync } from "fs";
import { join } from "path";

const sexcano_raw = readFileSync(join(__dirname, "sexcano.hbs"), "utf-8");
const sexcano_json = JSON.parse(sexcano_raw);

const SEXCANO_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 1,
      maxX: 33,
      minY: -183,
      maxY: 187,
    },
    passingDirection: Direction.LEFT,
  },
  sectorOne: {
    bounds: {
      minX: 1,
      maxX: 33,
      minY: -183,
      maxY: 187,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: 235.7681755829904,
      maxX: 267.7681756,
      minY: 139.7462277091907,
      maxY: 347.2222222222223,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: 914.0000000000002,
      maxX: 946,
      minY: -802.0000000000002,
      maxY: -588.0000000000001,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Cano Sexcuit by Rodri",
  boxLine: {
    minX: 754,
    maxX: 754,
    minY: -149,
    maxY: -149,
  },
  pitlaneStart: {
    minX: 535.0429304475944,
    maxX: 677.1389015902048,
    minY: 116.69333942996495,
    maxY: 148.6933394,
  },
  pitlaneEnd: {
    minX: 207.1902149062643,
    maxX: 239.1902149,
    minY: 3.1753289640806788,
    maxY: 140.50830666057004,
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
    x: sexcano_json.redSpawnPoints[sexcano_json.redSpawnPoints.length - 1][0],
    y: sexcano_json.redSpawnPoints[sexcano_json.redSpawnPoints.length - 1][1],
  },
  BestTime: bestTimes.sexcano,
  MainColor: [0xc60b1e],
  AvatarColor: 0xe2aa39,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  pitSpeed: 1,
  physicsType: CircuitPhysics.CLASSIC,
};

export const SEXCANO: Circuit = {
  map: sexcano_raw,
  info: SEXCANO_INFO,
};
