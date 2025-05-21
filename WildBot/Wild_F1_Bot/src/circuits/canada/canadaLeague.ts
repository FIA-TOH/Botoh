import { bestTimes } from "../bestTimes";
import {Circuit, CircuitInfo, Direction} from "../Circuit";
import canadaLeague_json from "./canadaLeague.json";

const CANADALEAGUE_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: -2770,
            maxX: -2745,
            minY: 236,
            maxY: 660
        },
        passingDirection: Direction.LEFT
    },
    sectorOne:{
        bounds: {
            minX: -2770,
            maxX: -2745,
            minY: 236,
            maxY: 660
            },
            passingDirection: Direction.LEFT
    },
    sectorTwo:{
        bounds: {
            minX: -924,
            maxX: -894,
            minY: -849,
            maxY: -576
        },
        passingDirection: Direction.RIGHT
    },
    sectorThree:{
        bounds: {
            minX: 2801,
            maxX: 2830,
            minY: -4,
            maxY: 245
        },
        passingDirection: Direction.RIGHT
    },
    name: "Circuit Gilles Villeneuve - By Ximb",
    boxLine: {
        minX: -2720,
        maxX: -1885,
        minY: 548,
        maxY: 618
    },
    pitlaneStart: {
        minX: -1264,
        maxX: -1234,
        minY: 436,
        maxY: 602
    },
    pitlaneEnd: {
        minX: -3321,
        maxX: -3291,
        minY: 439,
        maxY: 740
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
        x: canadaLeague_json.redSpawnPoints[canadaLeague_json.redSpawnPoints.length - 1][0],
        y: canadaLeague_json.redSpawnPoints[canadaLeague_json.redSpawnPoints.length - 1][1],
    },
    BestTime: bestTimes.canada,
    MainColor: [0xd6001d, 0xffffff, 0xd6001d],
    AvatarColor: 0x000001,
    Angle: 90,
    Limit: 5,
    Votes: 0,
    pitSpeed: 0.96
}

export const CANADALEAGUE: Circuit = {
    map: JSON.stringify(canadaLeague_json),
    info: CANADALEAGUE_INFO
}