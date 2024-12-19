import { bestTimes } from "../bestTimes";
import {Circuit, CircuitInfo, Direction} from "../Circuit";
import valencia_json from "./valencia.json";


const VALENCIA_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: -215,
            maxX: 210,
            minY: 68,
            maxY: 100
        },
        passingDirection: Direction.UP
    },
    name: "Valencia Street Circuit - By Ximb",
    boxLine: {
        minX: 85,
        maxX: 200,
        minY: 130,
        maxY: 714
    },
    pitlaneStart: {
        minX: 18,
        maxX: 200,
        minY: 730,
        maxY: 760
    },
    pitlaneEnd: {
        minX: 10,
        maxX: 125,
        minY: -436,
        maxY: -406
    },
    drsStart: [
        {
            minX: 0,
            maxX: 0,
            minY: 0,
            maxY: 0,
        },
        {
            minX: 0,
            maxX: 0,
            minY: 0,
            maxY: 0,
        }
    ],
    drsEnd: [
        {
            minX: 0,
            maxX: 0,
            minY: 0,
            maxY: 0,
        },
        {
            minX: 0,
            maxX: 0,
            minY: 0,
            maxY: 0,
        },
        
    ],
    checkpoints: [],
    lastPlace: {
        x: valencia_json.redSpawnPoints[valencia_json.redSpawnPoints.length - 1][0],
        y: valencia_json.redSpawnPoints[valencia_json.redSpawnPoints.length - 1][1],
    },
    BestTime: bestTimes.valencia,
    MainColor: [0xc60b1e, 0xffc400, 0xc60b1e],
    AvatarColor: 0xffffff,
    Angle: 90,
    Limit: 5,
    Votes: 0,
}

export const VALENCIA: Circuit = {
    map: JSON.stringify(valencia_json),
    info: VALENCIA_INFO
}