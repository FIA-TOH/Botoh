import {Circuit, CircuitInfo, Direction} from "../Circuit";
import sepang_json from "./sepang.json";

const SEPANG_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: 102,
            maxX: 132,
            minY: -345,
            maxY: 6
        },
        passingDirection: Direction.LEFT
    },
    name: "Sepang F1 International Circuit - By Ximb",
    boxLine: {
        minX: 133,
        maxX: 1226,
        minY: -345,
        maxY: -253
    },
    pitlaneStart: {
        minX: 1496,
        maxX: 1526,
        minY: -435,
        maxY: -268
    },
    pitlaneEnd: {
        minX: -219,
        maxX: -199,
        minY: -313,
        maxY: -183
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
        x: sepang_json.redSpawnPoints[sepang_json.redSpawnPoints.length - 1][0],
        y: sepang_json.redSpawnPoints[sepang_json.redSpawnPoints.length - 1][1],
    }
}

export const SEPANG: Circuit = {
    map: JSON.stringify(sepang_json),
    info: SEPANG_INFO
}