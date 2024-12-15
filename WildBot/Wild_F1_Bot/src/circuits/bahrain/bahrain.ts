import bahrain_json from "./bahrain.json"
import {Circuit, CircuitInfo, Direction} from "../Circuit";

const BAHRAIN_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: 70,
            maxX: 100,
            minY: -56,
            maxY: 271,
        },
        passingDirection: Direction.LEFT
    },
    name: "Sakhir Bahrain International Circuit - By Ximb",
    boxLine: {
        minX: 106,
        maxX: 1100,
        minY: -56,
        maxY: 10,
    },
    pitlaneStart: {
        minX: 1126,
        maxX: 1156,
        minY: -56,
        maxY: 66,
    },
    pitlaneEnd: {
        minX: -546,
        maxX: -516,
        minY: -49,
        maxY: 68,
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
        x: bahrain_json.redSpawnPoints[bahrain_json.redSpawnPoints.length - 1][0],
        y: bahrain_json.redSpawnPoints[bahrain_json.redSpawnPoints.length - 1][1],
    }
}
export const BAHRAIN: Circuit = {
    map: JSON.stringify(bahrain_json),
    info: BAHRAIN_INFO
}