import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, CircuitPhysics, Direction } from "../Circuit";
import { readFileSync } from "fs";
import { join } from "path";

const tandil_raw = readFileSync(join(__dirname, "tandil.hbs"), "utf-8");
const tandil_json = JSON.parse(tandil_raw);

const TANDIL_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 295,
      maxX: 710,
      minY: 270,
      maxY: 302,
    },
    passingDirection: Direction.DOWN,
  },
  sectorOne: {
    bounds: {
      minX: 295,
      maxX: 710,
      minY: 270,
      maxY: 302,
    },
    passingDirection: Direction.DOWN,
  },
  sectorTwo: {
    bounds: {
      minX: -905,
      maxX: -465,
      minY: 202,
      maxY: 234,
    },
    passingDirection: Direction.UP,
  },
  sectorThree: {
    bounds: {
      minX: -526,
      maxX: -381,
      minY: -596,
      maxY: -564,
    },
    passingDirection: Direction.UP,
  },
  name: "Tandil City by Metilazo",
  boxLine: {
    minX: 400,
    maxX: 400,
    minY: -490,
    maxY: -490,
  },
  pitlaneStart: {
    minX: 468,
    maxX: 686,
    minY: -179,
    maxY: -147,
  },
  pitlaneEnd: {
    minX: 569.601234788721,
    maxX: 710,
    minY: 213,
    maxY: 245,
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
    x: tandil_json.redSpawnPoints[tandil_json.redSpawnPoints.length - 1][0],
    y: tandil_json.redSpawnPoints[tandil_json.redSpawnPoints.length - 1][1],
  },
  BestTime: bestTimes.tandil,
  MainColor: [0x4f6f8f],
  AvatarColor: 0xffffff,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  pitSpeed: 1,
  physicsType: CircuitPhysics.CLASSIC,
};

export const TANDIL: Circuit = {
  map: tandil_raw,
  info: TANDIL_INFO,
};
