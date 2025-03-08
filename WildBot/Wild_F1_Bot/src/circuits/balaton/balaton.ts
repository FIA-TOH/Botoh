import { bestTimes } from "../bestTimes";
import {Circuit, CircuitInfo, Direction} from "../Circuit";
import balaton_json from "./balaton.json";

const BALATON_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: -32,
            maxX: 1,
            minY: -353,
            maxY: -5
        },
        passingDirection: Direction.LEFT
    },
    sectorOne:{
        bounds: {
            minX: 982,
            maxX: 114,
            minY: 189,
            maxY: 371
        },
        passingDirection: Direction.LEFT
    },
    sectorTwo:{
        bounds: {
            minX: 1605,
            maxX: 1632,
            minY: -425,
            maxY: -218
        },
        passingDirection: Direction.RIGHT
    },
    sectorThree:{
        bounds: {
            minX: 138,
            maxX: 170,
            minY: 3785,
            maxY: 4000
        },
        passingDirection: Direction.LEFT
    },
    name: "Balaton Park by Rodri",
    boxLine: {
        minX: -1,
        maxX: -353,
        minY: 1000,
        maxY: -273
    },
    pitlaneStart: {
        minX: -1267,
        maxX: -1299,
        minY: -299,
        maxY: -201
    },
    pitlaneEnd: {
        minX: -150,
        maxX: -118,
        minY: -400,
        maxY: -201
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
        x: balaton_json.redSpawnPoints[balaton_json.redSpawnPoints.length - 1][0],
        y: balaton_json.redSpawnPoints[balaton_json.redSpawnPoints.length - 1][1],
    },
    BestTime: bestTimes.balaton,
    MainColor: [0xd6001d, 0xd6001d, 0xffffff],
    AvatarColor: 0xffffff,
    Angle: 60,
    Limit: 5,
    Votes: 0,
    pitSpeed: 0.955
}

export const BALATON: Circuit = {
    map: JSON.stringify(balaton_json),
    info: BALATON_INFO
}