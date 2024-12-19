import { bestTimes } from "../bestTimes";
import {Circuit, CircuitInfo, Direction} from "../Circuit";
import monaco_json from "./monaco.json";

const MONACO_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: 70,
            maxX: 100,
            minY: -110,
            maxY: 157
        },
        passingDirection: Direction.LEFT
    },
    name: "Circuit de Monaco - By Ximb",
    boxLine: {
        minX: 103,
        maxX: 954,
        minY: -170,
        maxY: -22
    },
    pitlaneStart: {
        minX: 1216,
        maxX: 1246,
        minY: -315,
        maxY: -107
    },
    pitlaneEnd: {
        minX: 7,
        maxX: 37,
        minY: -54,
        maxY: 13
    },
    drsStart: [{
        minX: 0,
        maxX: 0,
        minY: 0,
        maxY: 0,
    }],
    drsEnd: [{
        minX: 0,
        maxX: 0,
        minY: 0,
        maxY: 0,
    }],
    checkpoints: [],
    lastPlace: {
        x: monaco_json.redSpawnPoints[monaco_json.redSpawnPoints.length - 1][0],
        y: monaco_json.redSpawnPoints[monaco_json.redSpawnPoints.length - 1][1],
    },
    BestTime: bestTimes.monaco,
    MainColor: [0xd6001d, 0xd6001d, 0xffffff],
    AvatarColor: 0xffffff,
    Angle: 60,
    Limit: 5,
    Votes: 0,
}

export const MONACO: Circuit = {
    map: JSON.stringify(monaco_json),
    info: MONACO_INFO
}