import { bestTimes } from "../bestTimes";
import {Circuit, CircuitInfo, Direction} from "../Circuit";
import indianapolis_json from "./indianapolis.json";

const INDIANAPOLIS_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: 431,
            maxX: 463,
            minY: 80,
            maxY: 460
        },
        passingDirection: Direction.RIGHT
    },
    name: "Indianapolis Motor Speedway",
    boxLine: {
        minX: 0,
        maxX:0,
        minY: 0,
        maxY: 0
    },
    pitlaneStart: {
        minX: 0,
        maxX:0,
        minY: 0,
        maxY: 0
    },
    pitlaneEnd: {
        minX: 0,
        maxX: 0,
        minY: 0,
        maxY: 0
    },
    drsStart: [
        {
            minX: 0,
            maxX: 0,
            minY: 0,
            maxY: 0,
        }
    ],
    drsEnd: [
        {
            minX: 0,
            maxX: 0,
            minY: 0,
            maxY: 0,
        }
    ],
    checkpoints: [],
    lastPlace: {
        x: indianapolis_json.redSpawnPoints[indianapolis_json.redSpawnPoints.length - 1][0],
        y: indianapolis_json.redSpawnPoints[indianapolis_json.redSpawnPoints.length - 1][1],
    },
    BestTime: bestTimes.indianapolis,
    MainColor: [0xffffff],
    AvatarColor: 0xbc002d,
    Angle: 90,
    Votes: 0
}

export const INDIANAPOLIS: Circuit = {
    map: JSON.stringify(indianapolis_json),
    info: INDIANAPOLIS_INFO
}