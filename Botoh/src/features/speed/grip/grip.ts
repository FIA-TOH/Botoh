import { playerList } from "../../changePlayerState/playerList";

export function calculateGripMultiplier(
  wear: number,
  norm: Number,
  maxGrip: number,
  minGrip: number
) {
  if (wear > 40) {
    const wearFactor = 0.1 * 1.6 ** ((wear - 40) / 10) - 0.1;
    return maxGrip - wearFactor * (maxGrip - minGrip);
  } else if (wear > 10) {
    return maxGrip;
  } else {
    return maxGrip - 0.0003;
  }
}
