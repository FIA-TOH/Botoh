import { bestTimes } from "../bestTimes";
import {Circuit, CircuitInfo, Direction} from "../Circuit";
import sochi_json from "./sochi.json";

const SOCHI_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: 2000,
            maxX: 2030,
            minY: 1441,
            maxY: 1684
        },
        passingDirection: Direction.LEFT
    },
    name: "Sochi Autodrom - By Ximb",
    boxLine: {
        minX: 2122,
        maxX: 3122,
        minY: 1320,
        maxY: 1421
    },
    pitlaneStart: {
        minX: 3086,
        maxX: 3223,
        minY: 1025,
        maxY: 1055
    },
    pitlaneEnd: {
        minX: 1328,
        maxX: 1358,
        minY: 1448,
        maxY: 1504
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
        x: sochi_json.redSpawnPoints[sochi_json.redSpawnPoints.length - 1][0],
        y: sochi_json.redSpawnPoints[sochi_json.redSpawnPoints.length - 1][1],
    },
    BestTime: bestTimes.sochi,
    MainColor: [0xffffff, 0x000080, 0xdd0000],
    AvatarColor: 0xFFE817,
    Angle: 90,
    Limit: 5,
    Votes: 0,
}

export const SOCHI: Circuit = {
    map: JSON.stringify(sochi_json),
    info: SOCHI_INFO
}