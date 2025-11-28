import { PlayerInfo } from "../../changePlayerState/playerList";
import { grip } from "../../rain/rainGrip";
import { Tires } from "../../tires&pits/tires";
import { constants } from "../constants";
import { gasEnabled } from "../handleSlipstream";

export function fuelGripCalc(p: PlayerInfo, grip: number) {
  if (gasEnabled && p.tires != Tires.TRAIN) {
    let gasPenalty;

    if (p.gas > 0) {
      const gasFactor = p.gas / 100;
      gasPenalty = constants.FULL_GAS_SPEED * gasFactor;
    } else {
      // Zero fuel penalty (very small)
      gasPenalty = constants.ZERO_GAS_PENALTY;
    }

    grip -= gasPenalty;
  }

  return grip;
}
