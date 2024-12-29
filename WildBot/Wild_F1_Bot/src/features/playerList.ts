import {Tires} from "./tires";
import {Language} from "./language";

interface PlayerInfo {
    drs: boolean;
    ip: string,
    currentLap: number,
    lapChanged: boolean,
    lapTime: number,
    speedEnabled: boolean,
    isInTheRoom: boolean,
    inPitlane: boolean,
    boxAlert: boolean | number,
    tires: Tires,
    wear: number,
    lapsOnCurrentTire: number,
    showTires: boolean,
    pits: number,
    language: Language,
    bestTime: number,
    gripCounter: number,
    maxSpeed: number,
    lastCheckTime: number,
    alertSent: { [key: number]: boolean },
    slipstreamEndTime: number | undefined,
    kers: number,
    penaltyCounter: number,
    afk: boolean,
    everyoneLaps: boolean,
    voted: boolean
}

type PlayerList = {
    [auth: string]: PlayerInfo
}

let actualPlayerList: PlayerList = {}

export let idToAuth: { [id: number]: string } = {}

export const playerList = new Proxy(actualPlayerList, {
    get(target, prop) {
        return target[idToAuth[Number(prop)]];
    },

    set(target, prop, newValue: PlayerInfo): boolean {
        target[idToAuth[Number(prop)]] = newValue;
        return true;
    }
});