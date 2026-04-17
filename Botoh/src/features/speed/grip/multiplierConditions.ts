import { playerList } from "../../changePlayerState/playerList";
import { Tires, tyresActivated } from "../../tires&pits/tires";
import { constants } from "../constants";
import { calculateGripForDryConditions } from "./dryCondition";
import { slipstreamEnabled, gasEnabled } from "../handleSlipstream";
import { ersActivated, ersPenalty } from "../fuel&Ers/ers";
import { vsc } from "../../safetyCar/vsc";
import { fuelGripCalc } from "../fuel&Ers/fuelGrip";
import { engineGripCalc } from "../development/engine";
import { chassiGripCalc } from "../development/chassi";
import { sandbagEnabled } from "../../commands/gameMode/battleRoyale.ts/handleSandbag";
import { calculateTotalDrift, getCurrentTireType } from "../../weather/rain/driftCalculator";


export function calculateGripMultiplierForConditions(
  player: PlayerObject,
  tyres: Tires,
  wear: number,
  norm: number,
  playerDisc: DiscPropertiesObject,
  effectiveSlipstream: number,
  isUsingErsInco: boolean,
  isUsingErs: boolean,
  room: RoomObject,
) {
  const p = playerList[player.id];

  // Player is in the pitlane or VSC is active → car should be restricted
  if (playerList.inPitLane || vsc) {
    return;
  } else {
    /**
     * ===========================================
     *  CASE 2 — DRY CONDITIONS AND TYRES ENABLED
     * ===========================================
     * Grip is derived from tyre compound + wear + track norm,
     * then we apply additional bonuses and penalties.
     */
    let grip = constants.NORMAL_SPEED;

    // Base grip from tyre behavior in dry conditions
    if (tyresActivated) {
      grip = calculateGripForDryConditions(tyres, wear, norm) ?? 1;
    }

    // DRS bonus
    if (p.drs) {
      grip += constants.DRS_SPEED_GAIN;
    }

    // Slipstream bonus
    if (effectiveSlipstream > 0 && slipstreamEnabled) {
      grip += effectiveSlipstream;
    }

    // ERS incorrect usage penalty
    if (isUsingErsInco && ersPenalty) {
      grip += constants.ERS_PENALTY;
    }

    // ERS activation attempt outside allowed zones
    if (isUsingErs && !ersActivated && ersPenalty) {
      grip += constants.ERS_PENALTY;
    }

    if (sandbagEnabled) {
      const sandbag = p.sandbagPenalty;
      grip -= sandbag;
    }

    // Fuel load penalty (except with TRAIN tyres)
    grip = fuelGripCalc(p, grip);

    // Chassis calculation penalty
    grip = chassiGripCalc(p, grip);

    // Soft tire drift penalty
    if (tyres === Tires.SOFT) {
      const playerInfo = playerList[player.id];
      if (playerInfo) {
        const currentTireType = getCurrentTireType(playerInfo);
        const currentSector = playerInfo.currentSector || 1;
        const currentTime = room.getScores()?.time ?? 0;
        const totalDrift = calculateTotalDrift(currentTireType, currentSector, currentTime);
        
        // 100 drift = -0.001 speed
        const driftPenalty = (totalDrift / 100) * 0.001;
        grip -= driftPenalty;
      }
    }

    // Engine calculation penalty
    // NOTE: this SHOULD be the last modifier applied because of grid
    grip = engineGripCalc(p, grip, playerDisc, player, room);

    // const speed = vectorSpeed(playerDisc.xspeed, playerDisc.yspeed);
    // room.setPlayerAvatar(player.id, speed.toString());
    return grip;
  }
}
