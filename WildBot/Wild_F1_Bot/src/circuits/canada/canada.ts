import { bestTimes } from "../bestTimes";
import {Circuit, CircuitInfo, Direction} from "../Circuit";
import canada_json from "./canada.json";

const CANADA_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: 84,
            maxX: 116,
            minY: 0,
            maxY: 325
        },
        passingDirection: Direction.LEFT
    },
    name: "Circuit Gilles Villeneuve - By Ximb",
    boxLine: {
        minX: 100,
        maxX: 936,
        minY: 325,
        maxY: 390
    },
    pitlaneStart: {
        minX: 1180,
        maxX: 1210,
        minY: 401,
        maxY: 496
    },
    pitlaneEnd: {
        minX: -1212,
        maxX: -1182,
        minY: 264,
        maxY: 348
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
        x: canada_json.redSpawnPoints[canada_json.redSpawnPoints.length - 1][0],
        y: canada_json.redSpawnPoints[canada_json.redSpawnPoints.length - 1][1],
    },
    BestTime: bestTimes.canada,
    MainColor: [0xd6001d, 0xffffff, 0xd6001d],
    AvatarColor: 0xd6001d,
    Angle: 90,
    Limit: 5,
    Votes: 0,
}

export const CANADA: Circuit = {
    map: JSON.stringify(canada_json),
    info: CANADA_INFO
}