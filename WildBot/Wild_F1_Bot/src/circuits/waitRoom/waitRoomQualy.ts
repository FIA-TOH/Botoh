import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";
import waitRoomQualy_json from "./waitRoomQualy.json";

const WAITROOMQUALY_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 9999,
      maxX: 9999,
      minY: 9999,
      maxY: 9999,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Wait Qualy Room - By Ximb",
  boxLine: {
    minX: 9999,
    maxX: 9999,
    minY: 9999,
    maxY: 9999,
  },
  pitlaneStart: {
    minX: 9999,
    maxX: 9999,
    minY: 9999,
    maxY: 9999,
  },
  pitlaneEnd: {
    minX: 9999,
    maxX: 9999,
    minY: 9999,
    maxY: 9999,
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
    x: waitRoomQualy_json.redSpawnPoints[
      waitRoomQualy_json.redSpawnPoints.length - 1
    ][0],
    y: waitRoomQualy_json.redSpawnPoints[
      waitRoomQualy_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.shanghai,
  MainColor: [0xd6001d],
  AvatarColor: 0xfae100,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.95,
};

export const WAITROOMQUALY: Circuit = {
  map: JSON.stringify(waitRoomQualy_json),
  info: WAITROOMQUALY_INFO,
};
