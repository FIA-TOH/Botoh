import {playerList} from "./playerList";
import {CHECK_IF_TROLLING, checkIfTrolling, getRunningPlayers, inHitbox} from "./utils";
import {CIRCUITS, currentMapIndex} from "./maps";
import {qualiMode, qualiTime} from "./qualiMode";
import {sendBestTimeRace, sendChatMessage, sendErrorMessage, sendSuccessMessage, sendWorseTime} from "./chat";
import {MESSAGES} from "./messages";
import {laps} from "./laps";
import {drsOn, enableDRS} from "./handleDRSZone";
import { rainIntensity } from "./rain";
import { ACTUAL_CIRCUIT } from "../room";
import { Teams } from "./teams";


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

function serialize(number: number) {
    return parseFloat(number.toFixed(3))
}

function ifInLapChangeZone(player: { p: PlayerObject, disc: DiscPropertiesObject }, room: RoomObject) {
    return room.getScores().time > 0 && inHitbox(player, CIRCUITS[currentMapIndex].info.finishLine.bounds)
}


export function checkPlayerLaps(playersAndDiscs: { p: PlayerObject, disc: DiscPropertiesObject }[], room: RoomObject) {
    const players = getRunningPlayers(playersAndDiscs)
    let bestTime = Math.min(...playersAndDiscs.map(pad => playerList[pad.p.id].bestTime))
    let circuitBestTime = ACTUAL_CIRCUIT.info.BestTime 
    ? ACTUAL_CIRCUIT.info.BestTime 
    : [999.999, undefined];

    players.forEach(pad => {
            const p = pad.p
            playerList[p.id].lapTime += 1 / 60

            if (!ifInLapChangeZone(pad, room) && playerList[p.id].lapChanged) {
                //EXITING CHANGE ZONE
                playerList[p.id].lapChanged = false
            }
            if (!ifInLapChangeZone(pad, room)) {
                // NOT IN CHANGE ZONE
                return;
            }

            if (playerList[p.id].lapChanged) {
                //ALREADY IN CHANGE ZONE
                return;
            }

            //ENTERED CHANGE ZONE

            if (CHECK_IF_TROLLING && checkIfTrolling(pad, CIRCUITS[currentMapIndex].info.finishLine.passingDirection)) {
                sendErrorMessage(room, MESSAGES.TROLLING_DETECTED(), p.id)
                room.setPlayerTeam(p.id, 0)
                return;
            }

            const currentLap = ++playerList[p.id].currentLap
            playerList[p.id].lapChanged = true

            if (currentLap > 1) {
                if(!drsOn && currentLap == 2) enableDRS(room);
                const lapTime = serialize(playerList[p.id].lapTime)
                const playersWithEveryoneLaps = playersAndDiscs.filter(pla => {
                    const player = playerList[pla.p?.id];
                    if (!player) {
                        return false;
                    }
                    if (!player.everyoneLaps) {
                        return false;
                    }
                    console.log(player);
                    
                    return true;
                });
                
                console.log("Filtered Players: ", playersWithEveryoneLaps);
                
                let correctRainIntensity = Math.round(rainIntensity)
                let roundWear = 100 - Math.round(playerList[p.id].wear)
                if (lapTime < (circuitBestTime[0] as number)) {
                    console.log(lapTime + " < " + (circuitBestTime[0] as number))
                    sendBestTimeRace(room, MESSAGES.TRACK_RECORD(p.name, lapTime), undefined);
                    playerList[p.id].bestTime = lapTime
                    ACTUAL_CIRCUIT.info.BestTime = [bestTime, p.name]
                } else if (bestTime === undefined || lapTime < bestTime){
                    console.log(lapTime + " < " + bestTime)
                    playerList[p.id].bestTime = lapTime
                    sendSuccessMessage(room, MESSAGES.LAP_TIME(lapTime), p.id)
                    playersWithEveryoneLaps.forEach(pla => {
                        console.log(pla);
                        
                        sendSuccessMessage(room, MESSAGES.LAP_TIME_FROM(lapTime, p.name), pla.p.id)
                    });
                } else {
                    sendWorseTime(room, MESSAGES.LAP_TIME(lapTime), p.id)
                    playersWithEveryoneLaps.forEach(pla => {
                        console.log(pla);
                        
                        sendSuccessMessage(room, MESSAGES.LAP_TIME_FROM(lapTime, p.name), pla.p.id)
                    });
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
                                sendChatMessage(room, MESSAGES.POSITION_AND_DISTANCE_AHEAD(position, distance, "laps"), p.id)
                            } else {
                                const distance = serialize(playerList[prevPlayer.id].lapTime)
                                sendChatMessage(room, MESSAGES.POSITION_AND_DISTANCE_AHEAD(position, distance, "seconds"), p.id)
                            }
                        } else {    
                            const playersOnSpec = playersAndDiscs.filter(pla=>pla.p.team !== Teams.RUNNERS)
                            playersOnSpec.forEach(pla => {
                                sendChatMessage(room, MESSAGES.CURRENT_LAP(currentLap, laps), pla.p.id)
                            });
                            
                        }

                    } else {
                        const fullTime = lapPositions.reduce((acc, curr) => {
                            const time = curr.find(c => c.id == p.id)?.time ?? 0
                            return acc + time
                        }, 0) + lapTime
                        finishList.push({
                            name: p.name,
                            pits: playerList[p.id].pits,
                            time: playerList[p.id].bestTime,
                            fullTime: fullTime
                        })
                        sendSuccessMessage(room, MESSAGES.FINISH_RACE(), p.id)
                        room.setPlayerTeam(p.id, 0)
                        return
                    }
                } else {
                    if (room.getScores().time >= qualiTime * 60) {
                        sendSuccessMessage(room, MESSAGES.FINISH_QUALI(), p.id)
                        room.setPlayerTeam(p.id, 0)
                        return
                    }
                }
            }
            playerList[p.id].lapTime = 0
        }
    )
}