import { playerList } from "../../changePlayerState/playerList";
// import { isRaining, rainEnabled } from "../../rain/rain";

const isRaining = false;
const rainEnabled = false;

export function updateGripCounter(
  playersAndDiscs: { p: PlayerObject; disc: DiscPropertiesObject }[]
) {
  playersAndDiscs.forEach((player) => {
    const playerInfo = playerList[player.p.id];

    if (isRaining && rainEnabled) {
      playerInfo.gripCounter++;
    }

    playerList[player.p.id] = playerInfo;
  });
}

export function calculateGripMultiplier(
  wear: number,
  norm: Number,
  maxGrip: number,
  minGrip: number
) {
  // 100% = tyreWear0, 0% = tyreWear100
  if (wear > 40) {
    const wearFactor = 0.1 * 1.6 ** ((wear - 40) / 10) - 0.1;
    return maxGrip - wearFactor * (maxGrip - minGrip);
  } else if (wear > 10) {
    return maxGrip;
  } else {
    return maxGrip - 0.0003;
  }
}
