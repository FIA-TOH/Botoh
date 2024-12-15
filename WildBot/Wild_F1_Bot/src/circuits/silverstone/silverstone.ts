import {Circuit, CircuitInfo, Direction} from "../Circuit";
import silverstone_json from "./silverstone.json";

const SILVERSTONE_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: 3,
            maxX: 33,
            minY: -220,
            maxY: 70
        },
        passingDirection: Direction.RIGHT
    },
    name: "Silverstone Circuit",
    boxLine: {
        minX: -400,
        maxX: -40,
        minY: 66,
        maxY: 186
    },
    pitlaneStart: {
        minX: -680,
        maxX: -475,
        minY: -50,
        maxY: -20
    },
    pitlaneEnd: {
        minX: 580,
        maxX: 610,
        minY: 30,
        maxY: 66
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
        x: silverstone_json.redSpawnPoints[silverstone_json.redSpawnPoints.length - 1][0],
        y: silverstone_json.redSpawnPoints[silverstone_json.redSpawnPoints.length - 1][1],
    }
}

export const SILVERSTONE: Circuit = {
    map: JSON.stringify(silverstone_json),
    info: SILVERSTONE_INFO
}