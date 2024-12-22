import { bestTimes } from "../bestTimes";
import {Circuit, CircuitInfo, Direction} from "../Circuit";
import shanghai_json from "./shanghai.json";

const SHANGHAI_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: 84,
            maxX: 114,
            minY: -140,
            maxY: 216
        },
        passingDirection: Direction.LEFT
    },
    name: "Shanghai International Circuit - By Ximb",
    boxLine: {
        minX: -525,
        maxX: 485,
        minY: -140,
        maxY: -80
    },
    pitlaneStart: {
        minX: 732,
        maxX: 967,
        minY: -52,
        maxY: -22
    },
    pitlaneEnd: {
        minX: -566,
        maxX: -536,
        minY: -140,
        maxY: 0
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
        x: shanghai_json.redSpawnPoints[shanghai_json.redSpawnPoints.length - 1][0],
        y: shanghai_json.redSpawnPoints[shanghai_json.redSpawnPoints.length - 1][1],
    },
    BestTime: bestTimes.shanghai,
    MainColor: [0xd6001d],
    AvatarColor: 0xfae100,
    Angle: 90,
    Limit: 5,
    Votes: 0,
}

export const SHANGHAI: Circuit = {
    map: JSON.stringify(shanghai_json),
    info: SHANGHAI_INFO
}