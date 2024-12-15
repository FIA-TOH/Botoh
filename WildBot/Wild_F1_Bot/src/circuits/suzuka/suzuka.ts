import {Circuit, CircuitInfo, Direction} from "../Circuit";
import suzuka_json from "./suzuka.json";

const SUZUKA_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: -30,
            maxX: 0,
            minY: -37,
            maxY: 167
        },
        passingDirection: Direction.RIGHT
    },
    name: "Suzuka Circuit",
    boxLine: {
        minX: -790,
        maxX: -190,
        minY: -157,
        maxY: -37
    },
    pitlaneStart: {
        minX: -940,
        maxX: -910,
        minY: -37,
        maxY: -17
    },
    pitlaneEnd: {
        minX: 230,
        maxX: 260,
        minY: -37,
        maxY: 17
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
        x: suzuka_json.redSpawnPoints[suzuka_json.redSpawnPoints.length - 1][0],
        y: suzuka_json.redSpawnPoints[suzuka_json.redSpawnPoints.length - 1][1],
    }
}

export const SUZUKA: Circuit = {
    map: JSON.stringify(suzuka_json),
    info: SUZUKA_INFO
}