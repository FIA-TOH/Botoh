import { bestTimes } from "../bestTimes";
import {Circuit, CircuitInfo, Direction} from "../Circuit";
import monza_json from "./monza.json";

const MONZA_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: 136,
            maxX: 151,
            minY: -145,
            maxY: 285
        },
        passingDirection: Direction.LEFT
    },
    name: "Autodromo Nazionale di Monza - By Ximb",
    boxLine: {
        minX: 170,
        maxX: 1200,
        minY: -140,
        maxY: -80
    },
    pitlaneStart: {
        minX: 1352,
        maxX: 1382,
        minY: -140,
        maxY: 3
    },
    pitlaneEnd: {
        minX: -21,
        maxX: 11,
        minY: -140,
        maxY: 3
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
        x: monza_json.redSpawnPoints[monza_json.redSpawnPoints.length - 1][0],
        y: monza_json.redSpawnPoints[monza_json.redSpawnPoints.length - 1][1],
    },
    BestTime: bestTimes.monza,
    MainColor: [0x009246, 0xffffff, 0xce2b37],
    AvatarColor: 0x000001,
    Angle: 0,
    Limit: 5,
    Votes: 0,
}

export const MONZA: Circuit = {
    map: JSON.stringify(monza_json),
    info: MONZA_INFO
}