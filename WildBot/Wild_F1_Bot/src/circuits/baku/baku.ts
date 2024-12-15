import { bestTimes } from "../bestTimes";
import {Circuit, CircuitInfo, Direction} from "../Circuit";
import baku_json from "./baku.json";

const BAKU_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: 1100,
            maxX: 1140,
            minY: -151,
            maxY: 204
        },
        passingDirection: Direction.RIGHT
    },
    name: "Baku City Circuit - By Ximb",
    boxLine: {
        minX: 0,
        maxX: 1100,
        minY: -148,
        maxY: -64
    },
    pitlaneStart: {
        minX: -396,
        maxX: -366,
        minY: -64,
        maxY: 22
    },
    pitlaneEnd: {
        minX: 2408,
        maxX: 2438,
        minY: -64,
        maxY: 22
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
        x: baku_json.redSpawnPoints[baku_json.redSpawnPoints.length - 1][0],
        y: baku_json.redSpawnPoints[baku_json.redSpawnPoints.length - 1][1],
    },
    BestTime: bestTimes.baku,
    MainColor: [0x00b5e2, 0xef3340, 0x509e2f],
    AvatarColor: 0xffffff,
    Angle: 90,
    Limit: 5,
    Votes: 0,
}

export const BAKU: Circuit = {
    map: JSON.stringify(baku_json),
    info: BAKU_INFO

}