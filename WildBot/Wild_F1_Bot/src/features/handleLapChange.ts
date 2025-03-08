import {PitsInfo, playerList} from "./playerList";
import {CHECK_IF_TROLLING, checkIfTrolling, getRunningPlayers, inHitbox} from "./utils";
import {CIRCUITS, currentMapIndex} from "./maps";
import {qualiMode, qualiTime, trainingMode, updatePlayerTime} from "./qualiMode";
import {sendBestTimeRace, sendChatMessage, sendErrorMessage, sendSuccessMessage, sendWorseTime} from "./chat";
import {MESSAGES} from "./messages";
import {laps} from "./laps";
import {drsOn, enableDRS} from "./handleDRSZone";
import { rainIntensity } from "./rain";
import { ACTUAL_CIRCUIT } from "../room";
import { Teams } from "./teams";
import { bestTimes, getAbbreviatedTrackName, updateBestTime } from "../circuits/bestTimes";
import { LEAGUE_MODE } from "./leagueMode";
import { printAllPositions } from "./handleCommands";
import { Tires } from "./tires";
import { checkBlueFlag } from "./handleSectorChange";


export const lapPositions: {
    id: number,
    name: string,
    currentLap: number,
    time: number
}[][] = []
for (let i = 0; i < laps; i++) {
    lapPositions[i] = []
}

export const finishList: {
    name: string,
    pits: number,
    time: number,
    fullTime: number
}[] = []

export const positionList: {
    name: string,
    pitsInfo: PitsInfo
    pits: number,
    time: number
    totalTime: number,
    lap: number,
    active: boolean,
    currentSector: number
}[] = [];

export function updatePositionList(players: { p: PlayerObject, disc: DiscPropertiesObject }[], room: RoomObject) {
    const activePlayers = new Set(players.map(player => player.p.name));

    players.forEach(player => {
        const { p } = player;
        const playerData = playerList[p.id];

        const playerPositionIndex = positionList.findIndex(entry => entry.name === p.name);
        const playerInfo = {
            name: p.name,
            pitsInfo: playerData.pits,
            pits: playerData.pits.pitsNumber,
            time: playerData.bestTime,
            totalTime: playerData.totalTime,
            lap: playerData.currentLap, 
            active: true,
            currentSector: playerData.currentSector 
        };

        if (playerPositionIndex !== -1) {
            positionList[playerPositionIndex] = playerInfo;
        } else {
            positionList.push(playerInfo);
        }
    });

    positionList.forEach(entry => {
        if (!activePlayers.has(entry.name)) {
            entry.active = false;
        }
    });


    positionList.sort((a, b) => {
        if (a.lap === b.lap) {
            if (a.currentSector === b.currentSector) {
                return a.totalTime - b.totalTime;
            }
            return b.currentSector - a.currentSector; 
        }
        return b.lap - a.lap;
    });

    // console.log(positionList);
}


function serialize(number: number) {
    return parseFloat(number.toFixed(3))
}

function someArray(array: number[]): number {
    return array.reduce((acc, value) => acc + value, 0);
}

function ifInLapChangeZone(player: { p: PlayerObject, disc: DiscPropertiesObject }, room: RoomObject) {
    return room.getScores().time > 0 && inHitbox(player, CIRCUITS[currentMapIndex].info.finishLine.bounds)
}


export function checkPlayerLaps(playersAndDiscs: { p: PlayerObject, disc: DiscPropertiesObject }[], room: RoomObject) {
    const players = getRunningPlayers(playersAndDiscs)

    players.forEach(pad => {
        const playerData = playerList[pad.p.id];
        const p = pad.p
        const hasSector = CIRCUITS[currentMapIndex].info.sectorOne
            playerData.lapTime += 1 / 60
            playerData.sectorTimeCounter += 1 / 60


        if (!ifInLapChangeZone(pad, room) && playerData.lapChanged) {
            // EXITING CHANGE ZONE
            playerData.lapChanged = false
        }
        if (!ifInLapChangeZone(pad, room)) {
            // NOT IN CHANGE ZONE
            return;
        }

        if (playerData.lapChanged) {
            // ALREADY IN CHANGE ZONE
            return;
        }

        // ENTERED CHANGE ZONE


        //CHEF IF TROLLING WITH SECTORS TOO
        if (CHECK_IF_TROLLING && checkIfTrolling(pad, CIRCUITS[currentMapIndex].info.finishLine.passingDirection)) {
            //IF HAS SECTORS
            if(hasSector){
                sendErrorMessage(room, MESSAGES.TROLLING_DETECTED(), p.id)
                return;
            } else {
                sendErrorMessage(room, MESSAGES.TROLLING_DETECTED(), p.id)
                room.setPlayerTeam(p.id, 0)
                return;
            }
        }
        

        if((!hasSector || (hasSector && playerData.currentSector === 3))){
            const currentLap = ++playerData.currentLap
            playerData.lapChanged = true
            if (currentLap > 1) {

                
                if (!drsOn && currentLap == 2) enableDRS(room);
               
                var lapTime = serialize(playerData.lapTime)
                if(hasSector){
                    var lapTime = serialize(someArray(playerData.sectorTime))
                }
               
                let bestTimeP = serialize(playerData.bestTime)
    
                const playersWithEveryoneLaps = playersAndDiscs.filter(pla => {
                    const player = playerList[pla.p?.id];
                    return player && player.everyoneLaps;
                });
    
                let correctRainIntensity = Math.round(rainIntensity)
                let roundWear = 100 - Math.round(playerData.wear)
                const circuitBestTime: number | string = bestTimes[ACTUAL_CIRCUIT.info.name]?.[0] || 999.999;
    
                const abbreviatedTrackName = getAbbreviatedTrackName(ACTUAL_CIRCUIT.info.name);
    
                if (abbreviatedTrackName) {
                    const circuitBestTime: number | string = bestTimes[abbreviatedTrackName]?.[0] || 999.999;
    
                    if (typeof circuitBestTime === 'number' && lapTime < circuitBestTime) {
                        updateBestTime(ACTUAL_CIRCUIT.info.name, lapTime, p.name);
                        playerData.bestTime = lapTime;
                        sendBestTimeRace(room, MESSAGES.TRACK_RECORD(p.name, lapTime), undefined);
                        updatePlayerTime(p.name, lapTime)
                    } else if (lapTime < bestTimeP || bestTimeP === undefined) {
                        playerData.bestTime = lapTime;
                        playersWithEveryoneLaps.forEach(pla => {
                            sendSuccessMessage(room, MESSAGES.LAP_TIME_FROM(lapTime, p.name), pla.p.id);
                        });
                        sendSuccessMessage(room, MESSAGES.LAP_TIME(lapTime), p.id);
                        updatePlayerTime(p.name, lapTime)
                    } else {
                        sendWorseTime(room, MESSAGES.WORSE_TIME(lapTime, serialize(lapTime-bestTimeP)), p.id);
                        playersWithEveryoneLaps.forEach(pla => {
                            sendSuccessMessage(room, MESSAGES.LAP_TIME_FROM(lapTime, p.name), pla.p.id);
                        });
                    }
                    if(hasSector){
                        room.sendAnnouncement(`Sector 1: ${playerData.sectorTime[0]} | Sector 2: ${playerData.sectorTime[1]} | Sector 3: ${playerData.sectorTime[2]}`, p.id, 0xFF8F00)
                    }
                } else {
                    console.log(`Circuito ${ACTUAL_CIRCUIT.info.name} não encontrado no mapeamento de nomes.`);
                }
                
                if(qualiMode || playerData.tires === Tires.TRAIN){
                    playerData.kers = 100
                }
                sendChatMessage(room, MESSAGES.RAIN_INTENSITY_LAP(correctRainIntensity), pad.p.id)
                sendChatMessage(room, MESSAGES.TYRE_WEAR_LAP(roundWear), p.id)
    
                if (!qualiMode) {
                    if (currentLap <= laps) {
                        const lapIndex = currentLap - 2
                        const position = lapPositions[lapIndex].push({
                            id: p.id,
                            name: p.name,
                            currentLap: currentLap,
                            time: lapTime
                        })
                        sendChatMessage(room, MESSAGES.CURRENT_LAP(currentLap, laps), p.id)
    
                        if (position > 1) {
                            const prevPlayerIndex = position - 2
                            const prevPlayer = lapPositions[lapIndex][prevPlayerIndex]
    
                            if (prevPlayer.currentLap > currentLap) {
                                const distance = prevPlayer.currentLap - currentLap
                                if(!trainingMode){
                                    sendChatMessage(room, MESSAGES.POSITION_AND_DISTANCE_AHEAD(position, distance, "laps"), p.id)
                                }
                                
                            } else {
                                const distance = serialize(playerList[prevPlayer.id].lapTime)
                                sendChatMessage(room, MESSAGES.POSITION_AND_DISTANCE_AHEAD(position, distance, "seconds"), p.id)
                            }
                        } else {    
                            const playersOnSpec = playersAndDiscs.filter(pla => pla.p.team !== Teams.RUNNERS)
                            playersOnSpec.forEach(pla => {
                                sendChatMessage(room, MESSAGES.CURRENT_LAP(currentLap, laps), pla.p.id)
                                printAllPositions(room, pla.p.id)
                            });
                        }
                    } else {
                        const fullTime = lapPositions.reduce((acc, curr) => {
                            const time = curr.find(c => c.id == p.id)?.time ?? 0
                            return acc + time
                        }, 0) + lapTime
                        finishList.push({
                            name: p.name,
                            pits: playerData.pits.pitsNumber,
                            time: playerData.bestTime,
                            fullTime: fullTime
                        })
                        sendSuccessMessage(room, MESSAGES.FINISH_RACE(), p.id)
                        playerList[p.id].totalTime = room.getScores().time;
                        updatePositionList(players, room);
                        room.setPlayerTeam(p.id, 0)
                        return
                    }
                } else {
                    const qualiTimeLimit = qualiTime * 60 ;
                    if (room.getScores().time >= qualiTimeLimit) {
                        sendSuccessMessage(room, MESSAGES.FINISH_QUALI(), p.id);
                        room.setPlayerTeam(p.id, 0);
                        return;
                    }
                    
                }
                
            }
            playerData.lapTime = 0
            playerData.sectorTimeCounter = 0
            playerData.sectorTime = []
            playerData.currentSector = 1;
            playerList[p.id].totalTime = room.getScores().time;
            if(!qualiMode || !trainingMode){
                updatePositionList(players, room);
                checkBlueFlag(p, room);
            }

        }
        
    })
}
