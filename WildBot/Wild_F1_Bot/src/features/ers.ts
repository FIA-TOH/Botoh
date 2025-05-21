
import { handleAvatar } from "./handleAvatar";
import { playerNerfList, presentationLap } from "./handleCommands";
import { gasEnabled, slipstreamEnabled } from "./handleSlipstream";
import { TIRE_AVATAR, vsc } from "./handleSpeed";
import { ifInBoxZone } from "./pits";
import { playerList } from "./playerList";
import { gameMode, GameMode } from "./qualiMode";
import { Tires } from "./tires";
import { getRunningPlayers } from "./utils";

export function updateErs(playersAndDiscs: { p: PlayerObject, disc: DiscPropertiesObject }[], room: RoomObject) {  
    const players = getRunningPlayers(playersAndDiscs);

    players.forEach(pad => {
        const p = pad.p;
        const properties = pad.disc;
        const playerInfo = playerList[p.id];
     
        const isNerfed = playerNerfList.some(nerfPlayer => nerfPlayer.name === p.name);

        if (!gasEnabled) {  
            if (room.getScores()?.time > 0) {
                if (properties.damping === 0.986) {
                    handleAvatar("Ers", p, room);
                } else {
                    if (playerInfo.kers < 100) {
                        const baseRecharge = 100 / (2 * 60 * 60);
                        const rechargeRate = isNerfed ? baseRecharge * 1.25 : baseRecharge;
    
                        playerInfo.kers += rechargeRate;
    
                        if (playerInfo.kers > 100) playerInfo.kers = 100;
                    }
                }
            }
            } else {
            
                const fuelDurationMinutes = 10;
                const reductionPercent = 50;
                const refuelSeconds = 10;
                
                const totalFrames = fuelDurationMinutes * 60 * 60;
                const baseFuelConsumption = 100 / totalFrames;
                const refuelRate = 100 / (refuelSeconds * 60);
                
                if (playerInfo.prevGas === undefined) {
                    playerInfo.prevGas = Math.floor(playerInfo.gas || 0);
                }
                
                const time = room.getScores().time;
                const isInBox = ifInBoxZone({ p: p, disc: room.getPlayerDiscProperties(p.id) }, room);
                const isPreGame = time === 0;
                const canRefuel = properties.damping === 0.99601 && (isInBox || isPreGame);
                
                if (playerInfo.gas > 0 || canRefuel) {
                    let fuelChange = 0;
                
                    if (canRefuel) {
                        fuelChange = -refuelRate;

                        if (playerInfo.gas + (-fuelChange) >= 100) {
                            playerInfo.gas = 0;
                        } else {
                            playerInfo.gas -= fuelChange;
                        }
                
                    } else if (time > 0 && gameMode !== GameMode.QUALY && !presentationLap && !vsc && playerInfo.tires) {

                        fuelChange = baseFuelConsumption;
                
                        if (properties.damping === 0.99601) {
                            fuelChange *= (1 - reductionPercent / 100);
                        }
                
                        playerInfo.gas -= fuelChange;
                    }
                
                    if (playerInfo.gas > 100) playerInfo.gas = 100;
                    if (playerInfo.gas < 0) playerInfo.gas = 0;
                
                    const currentGasInt = Math.floor(playerInfo.gas);
                
                    if (currentGasInt !== playerInfo.prevGas) {
                        room.setPlayerAvatar(p.id, String(currentGasInt));
                        playerInfo.prevGas = currentGasInt;
                    }
                }
            }
    });
}
