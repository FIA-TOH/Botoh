import { playerList } from "./playerList";
import { CIRCUITS, currentMapIndex } from "./maps";
import { getRunningPlayers, inHitbox, vectorSpeed } from "./utils";
import { sendAlertMessage, sendChatMessage, sendErrorMessage } from "./chat";
import { MESSAGES } from "./messages";
import { Teams } from "./teams";
import { TIRE_STARTING_SPEED, Tires } from "./tires";
import { grip } from "./rainGrip";
import { rainEnabled, rainIntensity, isRaining } from "./rain";
import { handleAvatar } from "./handleAvatar";
import { handleFlagCommand, tyresActivated } from "./handleCommands";
import { room } from "../room";
import { LEAGUE_MODE } from "./leagueMode";


export const TIRE_AVATAR: {
    [key in Tires]: string
} = {
    "SOFT": "🔴",
    "MEDIUM": "🟡",
    "HARD": "⚪",
    "INTER": "🟢",
    "WET": "🔵",
    "FLAT": "⚫",
    "TRAIN": "🟣"
}

export let vsc = false


export function changeVSC() {
    vsc = !vsc
}


function distanceFromPointToLine(playerDisc: DiscPropertiesObject, otherDisc: DiscPropertiesObject) {

    const x1 = otherDisc.x;
    const y1 = otherDisc.y;

    const x2 = otherDisc.x + otherDisc.xspeed;
    const y2 = otherDisc.y + otherDisc.yspeed;

    const x3 = playerDisc.x;
    const y3 = playerDisc.y;

    // Calculate the coefficients of the line equation Ax + By + C = 0
    let A = y2 - y1;
    let B = x1 - x2;
    let C = (x2 * y1) - (x1 * y2);

    // Calculate the distance using the point-line distance formula
    return Math.abs(A * x3 + B * y3 + C) / Math.sqrt(A * A + B * B);
}

// Function to calculate the slipstream effect
function calculateSlipstream(player: { p: PlayerObject, disc: DiscPropertiesObject }, others: {
    p: PlayerObject,
    disc: DiscPropertiesObject
}[]) {
    const disc = player.disc;
    let maxSlipstream = 0;

    others.forEach(other => {
        const otherDisc = other.disc;
        const distance = Math.sqrt((otherDisc.x - disc.x) ** 2 + (otherDisc.y - disc.y) ** 2);

        if (distance > 0) {
            const angleToOther = Math.atan2(otherDisc.y - disc.y, otherDisc.x - disc.x);
            const playerDirection = Math.atan2(disc.yspeed, disc.xspeed);
            const otherDirection = Math.atan2(otherDisc.yspeed, otherDisc.xspeed);
            const directionDifference = Math.abs(playerDirection - otherDirection);

            // Normalize angle difference to [0, π]
            const normalizedDirectionDifference = Math.min(directionDifference, Math.abs(2 * Math.PI - directionDifference));

            // Check if the other player is in front (within a 60-degree cone in front)
            const isInFront = Math.cos(playerDirection - angleToOther) > 0.5;

            if (isInFront && normalizedDirectionDifference < Math.PI / 4) { // They are roughly moving in the same direction
                const otherSpeed = vectorSpeed(otherDisc.xspeed, otherDisc.yspeed);
                const distanceToLine = distanceFromPointToLine(disc, otherDisc);
                const effectModifier = Math.max(0, -(distanceToLine - 1) / 14 + 1); // Ensure the effect modifier is not negative
                const slipstreamEffect = (otherSpeed / (distance / 10)) * effectModifier;
                
                if (slipstreamEffect > maxSlipstream) {
                    maxSlipstream = slipstreamEffect;
                }
            }
        }
    });

    const finalSlipstream = Math.min(0.005, maxSlipstream / 100);
    return finalSlipstream;
}

export let slipstreamEnabled = false

export function toggleSlipstream() {
    slipstreamEnabled = !slipstreamEnabled
}

const NORMAL_SPEED = 1
const SLIPSTREAM_SPEED_GAIN = 0.0005
const DRS_SPEED_GAIN = 0.001
const ERS_PENALTY = -0.006
const JUMP_START_PENALTY = -0.005

/**
 * Function that sets a players max speed.
 *
 * Note: This does require a high tick-rate. At least on Chrome, this requires the headless host tab to be visible/selected.
 */
export function controlPlayerSpeed(
    playersAndDiscsSubset: { p: PlayerObject; disc: DiscPropertiesObject }[],
    room: RoomObject
) {
    const currentTime = room.getScores()?.time || 0;

    playersAndDiscsSubset.forEach((player) => {
        const p = player.p;
        const properties = player.disc;
        const playerInfo = playerList[p.id];

        const { xspeed: x, yspeed: y } = properties;
        const norm = Math.hypot(x, y);

        let normalX = 0;
        let normalY = 0;

        if (norm !== 0) {
            normalX = x / norm;
            normalY = y / norm;
        }

        let hasSlipstream = false;
        let effectiveSlipstream = 0;

        if (slipstreamEnabled) {
            const slipstream = calculateSlipstream(
                player,
                playersAndDiscsSubset.filter((playerl) => playerl.p.id !== p.id)
            );
            if (slipstream > 0.001 && !playerInfo.inPitlane && !vsc) {
                playerInfo.slipstreamEndTime = undefined;
            } else if (playerInfo.slipstreamEndTime === undefined) {
                playerInfo.slipstreamEndTime = currentTime;
            }

            const withinSlipstreamTime =
                playerInfo.slipstreamEndTime !== undefined &&
                currentTime - playerInfo.slipstreamEndTime <= 2;

            effectiveSlipstream = withinSlipstreamTime ? 0.001 : slipstream;
            hasSlipstream = effectiveSlipstream > 0;
        }

        const isUsingErsInco = playerInfo.kers <= 0 && properties.damping === 0.986;

        const gripMultiplier = calculateGripMultiplierForConditions(
            p,
            playerInfo.tires,
            playerInfo.wear,
            norm,
            properties,
            hasSlipstream,
            isUsingErsInco
        );

        let gripMultiplierSlow = 0;
        if (vsc) {
            gripMultiplierSlow = 0.985;
        } else if (playerInfo.inPitlane) {
            gripMultiplierSlow = 0.95;
        }

        

        if (gripMultiplierSlow > 0) {
            // VSC ou Pitlane
            const newGravityX = -x * (1 - gripMultiplierSlow);
            const newGravityY = -y * (1 - gripMultiplierSlow);

            room.setPlayerDiscProperties(p.id, {
                xgravity: newGravityX,
                ygravity: newGravityY,
            });
        } else if (
            norm > 0 &&
            grip(playerInfo.tires, rainIntensity) < playerInfo.gripCounter &&
            rainEnabled &&
            isRaining &&
            gripMultiplier
        ) {
            
            // Chuva
            playerInfo.gripCounter = 0;
            const newGravityX = -x * (1 - gripMultiplier);
            const newGravityY = -y * (1 - gripMultiplier);

            room.setPlayerDiscProperties(p.id, {
                xspeed: x,
                yspeed: y,
                xgravity: newGravityX,
                ygravity: newGravityY,
            });
        } else if (tyresActivated && gripMultiplier) {
            // Normal
            const newGravityX = -x * (1 - gripMultiplier);
            const newGravityY = -y * (1 - gripMultiplier);

            room.setPlayerDiscProperties(p.id, {
                xgravity: newGravityX,
                ygravity: newGravityY,
            });
        }

        playerList[p.id] = playerInfo;
    });
}

export function updateGripCounter(playersAndDiscs: { p: PlayerObject; disc: DiscPropertiesObject }[]) {
    playersAndDiscs.forEach(player => {
        const playerInfo = playerList[player.p.id];
        
        if (isRaining && rainEnabled) {
            playerInfo.gripCounter++;
        }

        playerList[player.p.id] = playerInfo;
    });
}




function calculateGripMultiplierForConditions(player: PlayerObject, tyres: Tires, wear: number, norm: Number, playerDisc: DiscPropertiesObject, hasSlipstream: boolean, isUsingErsInco: boolean) {
    const p = playerList[player.id]
    if (playerList.inPitLane || vsc) {
        return;
    } else if(!tyresActivated){
        if (hasSlipstream && slipstreamEnabled) {
            NORMAL_SPEED + SLIPSTREAM_SPEED_GAIN; 
        }
        if (isUsingErsInco){
            NORMAL_SPEED + ERS_PENALTY
        }
        return NORMAL_SPEED;
    }else if(!isRaining) {
        let grip = calculateGripForDryConditions(tyres, wear, norm) ?? 1;
        if(p.drs){
            grip += DRS_SPEED_GAIN
        }
        if (hasSlipstream && slipstreamEnabled) {
            grip += SLIPSTREAM_SPEED_GAIN; 
        }
        if (isUsingErsInco){
            grip += ERS_PENALTY
        }

        return grip;

    } else {
      return calculateGripForWetConditions(tyres, wear, norm);
    }
}

function calculateGripForDryConditions(tyres: Tires, wear: number, norm: Number) {
    if (!norm) return;
    switch (tyres) {
        case "SOFT":
            return calculateGripMultiplier(wear, norm, 1.0, 0.993);
        case "MEDIUM":
            return calculateGripMultiplier(wear, norm, 0.9999, 0.994);
        case "HARD":
            return calculateGripMultiplier(wear, norm, 0.9998, 0.995);
        case "INTER":
            return calculateGripMultiplier(wear, norm, 0.998, 0.995);
        case "WET":
            return calculateGripMultiplier(wear, norm, 0.997, 0.994);
        case "FLAT":
            return 0.99;
        case "TRAIN":
            return 1.0;
    }
}

function calculateGripForWetConditions(tyres: Tires, wear: number, norm: Number) {
    if (!norm) return;

    const normalizedRain = rainIntensity / 100;

    switch (tyres) {
        case "TRAIN":
        case "SOFT":
        case "MEDIUM":
        case "HARD": {
            // Decaimento linear de 0.001 a cada 10% de intensidade de chuva
            const rainImpact = Math.floor(normalizedRain / 0.1) * 0.001;
            const maxGrip = 0.998 - rainImpact;
            const minGrip = 0.995 - rainImpact;
            return calculateGripMultiplier(wear, norm, maxGrip, minGrip);
        }

        case "INTER": {
            // Sem impacto até 40%, depois decaimento de 0.001 por 10%
            if (normalizedRain <= 0.6) {
                return calculateGripMultiplier(wear, norm, 0.998, 0.996);
            } else {
                const rainImpact = Math.floor((normalizedRain - 0.6) / 0.1) * 0.001;
                const maxGrip = 0.998 - rainImpact;
                const minGrip = 0.996 - rainImpact;
                return calculateGripMultiplier(wear, norm, maxGrip, minGrip);
            }
        }

        case "WET": {
            const maxGrip = 0.997;
            const minGrip = 0.994;
            return calculateGripMultiplier(wear, norm, maxGrip, minGrip);
        }

        case "FLAT":
            return 0.99;

        default:
            return;
    }
}

function calculateGripMultiplier(wear: number, norm: Number, maxGrip: number, minGrip: number) {
    // 100% = tyreWear0, 0% = tyreWear100
    if (wear > 40) {
        const wearFactor = 0.1 * (1.6 ** ((wear - 40) / 10)) - 0.1;
        return maxGrip - wearFactor * (maxGrip - minGrip);
    } else if (wear > 10) {
      return maxGrip;
    } else {
      return maxGrip - 0.0001;
    }
  }

function ifInBoxZone(player: { p: PlayerObject, disc: DiscPropertiesObject }, room: RoomObject) {
    return room.getScores().time > 0 && inHitbox(player, CIRCUITS[currentMapIndex].info.boxLine)
}

export function enableShowTires(player: PlayerObject, room: RoomObject) {

    const tires = !playerList[player.id].showTires;
    const speed = !tires;

    playerList[player.id].showTires = tires;
    playerList[player.id].speedEnabled = speed;

    handleAvatar(tires ? "ChangeTyre" : "Speed", player, room);

    // Determinar mensagem apropriada
    const message = tires ? MESSAGES.NOW_SHOWING_TIRES() : MESSAGES.NOW_SHOWING_SPEED();
    sendChatMessage(room, message, player.id);
}

export function changeTires(player: { p: PlayerObject, disc: DiscPropertiesObject }, chosen: Tires, room: RoomObject) {
    if (player.p.team !== Teams.RUNNERS) {
        sendErrorMessage(room, MESSAGES.NOT_RUNNER(), player.p.id)
        return false
    }

    if (room.getScores() === null) {
        sendErrorMessage(room, MESSAGES.NOT_STARTED(), player.p.id)
        return false
    }

    if (!ifInBoxZone(player, room) && room.getScores().time > 0 && chosen != Tires.FLAT) {
        sendErrorMessage(room, MESSAGES.NOT_IN_BOXES(), player.p.id)
        return false
    }

    playerList[player.p.id].wear = 0; 
    playerList[player.p.id].alertSent = {};
    playerList[player.p.id].tires = chosen
    playerList[player.p.id].lapsOnCurrentTire = -1
    playerList[player.p.id].gripCounter = 0
    playerList[player.p.id].maxSpeed = TIRE_STARTING_SPEED[chosen]
    sendChatMessage(room, MESSAGES.CHANGED_TIRES(player.p.name, chosen))

    handleAvatar("ChangeTyre", player.p, room)
}

function ifInPitlaneStart(player: { p: PlayerObject, disc: DiscPropertiesObject }, room: RoomObject) {
    return room.getScores().time > 0 && inHitbox(player, CIRCUITS[currentMapIndex].info.pitlaneStart)

}

function ifInPitlaneEnd(player: { p: PlayerObject, disc: DiscPropertiesObject }, room: RoomObject) {
    return room.getScores().time > 0 && inHitbox(player, CIRCUITS[currentMapIndex].info.pitlaneEnd)
}

export function handlePitlane(playersAndDiscs: { p: PlayerObject, disc: DiscPropertiesObject }[], room: RoomObject) {
    const players = getRunningPlayers(playersAndDiscs)
    players.forEach(player => {
        const p = player.p
        if (ifInPitlaneStart(player, room) && !playerList[p.id].inPitlane) {
            playerList[p.id].pits.pitsNumber += 1
            playerList[p.id].inPitlane = true
            if(LEAGUE_MODE && playerList[player.p.id].boxAlert === false){
                const numero = Math.floor(1000 + Math.random() * 9000);
                playerList[player.p.id].boxAlert = numero;
                sendAlertMessage(room, MESSAGES.CODE_BOX(numero), player.p.id)
            }
        }
        if (ifInPitlaneEnd(player, room) && playerList[p.id].inPitlane) {
            playerList[p.id].inPitlane = false
            if(LEAGUE_MODE && playerList[player.p.id].boxAlert !== false){

                playerList[player.p.id].boxAlert = false;
            }
        }
    })
}

// function detectStartJump(
//     p: PlayerObject, disc: DiscPropertiesObject,
//     room: RoomObject
//   ): boolean {
//     const scores = room.getScores();
//     if (!scores) return false;

    
    
//     const reactionTimeTooFast = scores.time > 0 && scores.time < 0.05;
//     const playerMoving = disc.xspeed != 0 || disc.yspeed != 0;
//     const playerData = playerList[p.id];
  
//     if (!playerData) return false; 

//     if(reactionTimeTooFast){
//         console.log(disc.xspeed, disc.yspeed);
//     }

//     if(scores.time == 0){
//         room.setPlayerDiscProperties(p.id, {
//             xspeed: 0,
//             yspeed: 0
//         })
//         return false;
//     }
//     if (playerData.penaltyCounter > 0) {
//       playerData.penaltyCounter -= 1;
//       return true;
//     }
  
//     if (reactionTimeTooFast && playerMoving) {
//       playerData.penaltyCounter = 120;
//       return true;
//     }
//     playerData.penaltyCounter = 0;
//     return false;
//   }
  
