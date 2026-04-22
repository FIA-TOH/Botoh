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
import { applyFinalDriftFactor } from "../drift/driftCalculator";
import { getCurrentTireType, calculateTotalDrift } from "../../weather/rain/driftCalculator";


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

  if (playerList.inPitLane || vsc) {
    return;
  } else {
    let grip = constants.NORMAL_SPEED;

    if (tyresActivated) {
      grip = calculateGripForDryConditions(tyres, wear, norm, player.id) ?? 1;
    }

    if (p.drs) {
      grip += constants.DRS_SPEED_GAIN;
    }

    if (effectiveSlipstream > 0 && slipstreamEnabled) {
      grip += effectiveSlipstream;
    }

    if (isUsingErsInco && ersPenalty) {
      grip += constants.ERS_PENALTY;
    }

    if (isUsingErs && !ersActivated && ersPenalty) {
      grip += constants.ERS_PENALTY;
    }

    if (sandbagEnabled) {
      const sandbag = p.sandbagPenalty;
      grip -= sandbag;
    }

    grip = fuelGripCalc(p, grip);
    grip = chassiGripCalc(p, grip);

    if (tyres === Tires.SOFT) {
      const playerInfo = playerList[player.id];
      if (playerInfo) {
        const currentTireType = getCurrentTireType(playerInfo);
        const currentSector = playerInfo.currentSector || 1;
        const currentTime = room.getScores()?.time ?? 0;
        const totalDrift = calculateTotalDrift(currentTireType, currentSector, currentTime);
        const driftPenalty = (totalDrift / 100) * 0.001;
        grip -= driftPenalty;
      }
    }

    grip = engineGripCalc(p, grip, playerDisc, player, room);

    const currentTime = room.getScores()?.time ?? 0;
    grip = applyFinalDriftFactor(grip, player.id, tyres, currentTime);

    return grip;
  }
}
