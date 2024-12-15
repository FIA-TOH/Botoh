import {Circuit, CircuitInfo, Direction} from "../Circuit";
import interlagos_json from "./interlagos.json";

const INTERLAGOS_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: 0,
            maxX: 30,
            minY: -167,
            maxY: 20
        },
        passingDirection: Direction.RIGHT
    },
    name: "Autodromo de Interlagos",
    boxLine: {
        minX: -920,
        maxX: -200,
        minY: 20,
        maxY: 140
    },
    pitlaneStart: {
        minX: -1136,
        maxX: -1106,
        minY: -25,
        maxY: 15
    },
    pitlaneEnd: {
        minX: 220,
        maxX: 280,
        minY: -17,
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
        x: interlagos_json.redSpawnPoints[interlagos_json.redSpawnPoints.length - 1][0],
        y: interlagos_json.redSpawnPoints[interlagos_json.redSpawnPoints.length - 1][1],
    }
}

export const INTERLAGOS: Circuit = {
    map: JSON.stringify(interlagos_json),
    info: INTERLAGOS_INFO

}