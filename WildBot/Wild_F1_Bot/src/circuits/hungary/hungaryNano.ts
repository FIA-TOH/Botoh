import {Circuit, CircuitInfo, Direction} from "../Circuit";
import hungaryNano_json from "./hungaryNano.json";

const HUNGARYNANO_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: -11,
            maxX: -43,
            minY: -131,
            maxY: 183
        },
        passingDirection: Direction.LEFT
    },
    name: "hungaroring By Nanoseb",
    boxLine: {
        minX: -495,
        maxX: 700,
        minY: -130,
        maxY: -75
    },
    pitlaneStart: {
        minX: 1089,
        maxX: 1120,
        minY: -101,
        maxY: 7
    },
    pitlaneEnd: {
        minX: -1000,
        maxX: -970,
        minY: -64,
        maxY: 23
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
        }
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
        }
    ],
    checkpoints: [],
    lastPlace: {
        x: hungaryNano_json.redSpawnPoints[hungaryNano_json.redSpawnPoints.length - 1][0],
        y: hungaryNano_json.redSpawnPoints[hungaryNano_json.redSpawnPoints.length - 1][1],
    }
}

export const HUNGARYNANO: Circuit = {
    map: JSON.stringify(hungaryNano_json),
    info: HUNGARYNANO_INFO
}