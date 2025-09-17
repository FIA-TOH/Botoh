

import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import {Circuit, CircuitInfo, Direction} from "../Circuit";

const paul_ricard_raw = readFileSync(join(__dirname, "paul_ricard.hbs"), "utf-8");
const paul_ricard_json = JSON.parse(paul_ricard_raw);




const PAUL_RICARD_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: -340,
            maxX: -325,
            minY: -170,
            maxY: 310
        },
        passingDirection: Direction.LEFT
    },
    name: "Paul Ricard Circuit - By Ximb",
    boxLine: {
        minX: -313,
        maxX: 447,
        minY: -174,
        maxY: -51
    },
    pitlaneStart: {
        minX: 500,
        maxX: 695,
        minY: -15,
        maxY: 15
    },
    pitlaneEnd: {
        minX: -1000,
        maxX: -970,
        minY: 1,
        maxY: 79
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
        x: paul_ricard_json.redSpawnPoints[paul_ricard_json.redSpawnPoints.length - 1][0],
        y: paul_ricard_json.redSpawnPoints[paul_ricard_json.redSpawnPoints.length - 1][1],
    },
    BestTime: bestTimes.paulRicard,
    MainColor: [0x0055a4, 0xffffff, 0xef4135],
    AvatarColor: 0x000001,
    Angle: 0,
    Limit: 5,
    Votes: 0,
  };

export const PAUL_RICARD: Circuit = {
    map: paul_ricard_raw,
    info: PAUL_RICARD_INFO
}