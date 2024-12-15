import {Circuit, CircuitInfo, Direction} from "../Circuit";
import hungary_json from "./hungary.json";

const HUNGARY_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: 318,
            maxX: 348,
            minY: 71,
            maxY: 204
        },
        passingDirection: Direction.LEFT
    },
    name: "Hungaroring by POPkORN",
    boxLine: {
        minX: 380,
        maxX: 1100,
        minY: -8,
        maxY: 22
    },
    pitlaneStart: {
        minX: 1155,
        maxX: 1185,
        minY: 5,
        maxY: 41
    },
    pitlaneEnd: {
        minX: -893,
        maxX: -768,
        minY: 51,
        maxY: 81
    },
    drsStart: [
        {
            minX: 1118,
            maxX: 1088,
            minY: 71,
            maxY: 204,
        },
        {
            minX: -1003,
            maxX: -973,
            minY: -319,
            maxY: -100,
        }
    ],
    drsEnd: [
        {
            minX: -718,
            maxX: -748,
            minY: 71,
            maxY: 204,
        },
        {
            minX: -182,
            maxX: -212,
            minY: -319,
            maxY: -100,
        }
    ],
    checkpoints: [],
    lastPlace: {
        x: hungary_json.redSpawnPoints[hungary_json.redSpawnPoints.length - 1][0],
        y: hungary_json.redSpawnPoints[hungary_json.redSpawnPoints.length - 1][1],
    }
}

export const HUNGARY: Circuit = {
    map: JSON.stringify(hungary_json),
    info: HUNGARY_INFO
}