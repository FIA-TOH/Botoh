import { bestTimes } from "../bestTimes";
import {Circuit, CircuitInfo, Direction} from "../Circuit";
import spaLeague_json from "./spaLeague.json";

const SPALEAGUE_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: -2963,
            maxX: -2932,
            minY: -1120,
            maxY: -747
        },
        passingDirection: Direction.LEFT
    },
    name: "Spa-Francorchamps - By Ximb",
    sectorOne:{
        bounds: {
            minX: -2963,
            maxX: -2932,
            minY: -1120,
            maxY: -747
        },
        passingDirection: Direction.LEFT
    },
    sectorTwo:{
        bounds: {
            minX: 2795,
            maxX: 2827,
            minY: -1641,
            maxY: -1385
        },
        passingDirection: Direction.RIGHT
    },
    sectorThree:{
        bounds: {
            minX: 1974,
            maxX: 2372,
            minY: 1620,
            maxY: 1652
        },
        passingDirection: Direction.DOWN
    },
    boxLine: {
        minX: -2960,
        maxX: -1670,
        minY: -1120,
        maxY: -1018
    },
    pitlaneStart: {
        minX: -1166,
        maxX: -1036,
        minY: -1107,
        maxY: -953
    },
    pitlaneEnd: {
        minX: -3195,
        maxX: -3165,
        minY: -1215,
        maxY: -960
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
        x: spaLeague_json.redSpawnPoints[spaLeague_json.redSpawnPoints.length - 1][0],
        y: spaLeague_json.redSpawnPoints[spaLeague_json.redSpawnPoints.length - 1][1],
    },
    BestTime: bestTimes.spa,
    MainColor: [0x000001, 0xfae042, 0xed2939],
    AvatarColor: 0xffffff,
    Angle: 0,
    Limit: 5,
    Votes: 0,
    pitSpeed: 0.96
}

export const SPALEAGUE: Circuit = {
    map: JSON.stringify(spaLeague_json),
    info: SPALEAGUE_INFO
}