import abu_dhabi_json from "./abu_dhabi.json";
import {Circuit, CircuitInfo, Direction} from "../Circuit";

const ABU_DHABI_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: 900,
            maxX: 930,
            minY: -268,
            maxY: -45
        },
        passingDirection: Direction.RIGHT
    },
    name: "Abu Dhabi Circuit",
    boxLine: {
        minX: -500,
        maxX: -20,
        minY: -388,
        maxY: -268
    },
    pitlaneStart: {
        minX: -921,
        maxX: -880,
        minY: -75,
        maxY: -45
    },
    pitlaneEnd: {
        minX: 980,
        maxX: 1010,
        minY: -268,
        maxY: -238
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
        x: abu_dhabi_json.redSpawnPoints[abu_dhabi_json.redSpawnPoints.length - 1][0],
        y: abu_dhabi_json.redSpawnPoints[abu_dhabi_json.redSpawnPoints.length - 1][1],
    }
}

export const ABU_DHABI: Circuit = {
    map: JSON.stringify(abu_dhabi_json),
    info: ABU_DHABI_INFO
}