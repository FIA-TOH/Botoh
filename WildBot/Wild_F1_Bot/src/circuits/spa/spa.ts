import { bestTimes } from "../bestTimes";
import {Circuit, CircuitInfo, Direction} from "../Circuit";
import spa_json from "./spa.json";

const SPA_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: -2963,
            maxX: -2932,
            minY: -1018,
            maxY: -747
        },
        passingDirection: Direction.LEFT
    },
    name: "Spa-Francorchamps - By Ximb ",
    boxLine: {
        minX: -2960,
        maxX: -1670,
        minY: -1120,
        maxY: -1018
    },
    pitlaneStart: {
        minX: -945,
        maxX: -244,
        minY: -838,
        maxY: -808
    },
    pitlaneEnd: {
        minX: -1203,
        maxX: -1173,
        minY: -1045,
        maxY: -954
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
        x: spa_json.redSpawnPoints[spa_json.redSpawnPoints.length - 1][0],
        y: spa_json.redSpawnPoints[spa_json.redSpawnPoints.length - 1][1],
    },
    BestTime: bestTimes.spa,
    MainColor: [0x000000, 0xfae042, 0xed2939],
    AvatarColor: 0xffffff,
    Angle: 0,
    Limit: 5,
    Votes: 0,
}

export const SPA: Circuit = {
    map: JSON.stringify(spa_json),
    info: SPA_INFO
}