

import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import {Circuit, CircuitInfo, Direction} from "../Circuit";

const istanbulLeague_raw = readFileSync(join(__dirname, "istanbulLeague.hbs"), "utf-8");
const istanbulLeague_json = JSON.parse(istanbulLeague_raw);




const ISTANBULLEAGUE_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: -100,
            maxX: -84,
            minY: -95,
            maxY: 269
        },
        passingDirection: Direction.RIGHT
    },
    name: "İstanbul Park - By Ximb",
    boxLine: {
        minX: -1101,
        maxX: -101,
        minY: -95,
        maxY: 6
    },
    pitlaneStart: {
        minX: -1198,
        maxX: -1168,
        minY: -32,
        maxY: 70
    },
    pitlaneEnd: {
        minX: 251,
        maxX: 281,
        minY: -6,
        maxY: 70
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
        x: istanbulLeague_json.redSpawnPoints[istanbulLeague_json.redSpawnPoints.length - 1][0],
        y: istanbulLeague_json.redSpawnPoints[istanbulLeague_json.redSpawnPoints.length - 1][1],
    },
    BestTime: bestTimes.istanbul,
    MainColor: [0xe30a17],
    AvatarColor: 0xfff0f0,
    Angle: 90,
    Limit: 5,
    Votes: 0,
}

export const ISTANBULLEAGUE: Circuit = {
    map: istanbulLeague_raw,
    info: ISTANBULLEAGUE_INFO
}