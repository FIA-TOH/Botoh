import { controlPlayerSpeed } from "./handleSpeed";
import { getRunningPlayers } from "../utils";
import { playerList } from "../changePlayerState/playerList";
let nextPlayerIndex = 0;
let accumulated = 0;

export function distributeSpeed(
  playersAndDiscs: { p: PlayerObject; disc: DiscPropertiesObject }[],
  room: RoomObject
) {
  const players = getRunningPlayers(playersAndDiscs);
  const totalPlayers = players.length;
  if (totalPlayers === 0) return;

  const ticksPerSecond = 60;
  const minTicksPerPlayer = 3;
  const reductionFactor = 0.75; //-25%

  const requiredProcessPerSecond = totalPlayers * minTicksPerPlayer;
  const avgProcessPerTick =
    (requiredProcessPerSecond / ticksPerSecond) * reductionFactor;

  accumulated += avgProcessPerTick;

  const processThisTick = Math.floor(accumulated);
  accumulated -= processThisTick;

  const playersToProcess = [];

  for (let i = 0; i < processThisTick; i++) {
    const player = players[nextPlayerIndex];
    if (player) {
      const playerAndDisc = playersAndDiscs.find(
        (pd) => pd.p.id === player.p.id
      );

      if (playerAndDisc) {
        const playerInfo = playerList[player.p.id];
        if (playerInfo?.inPitlane) {
          playersToProcess.push(playerAndDisc, playerAndDisc, playerAndDisc);
        } else {
          playersToProcess.push(playerAndDisc);
        }
      }
    }
    nextPlayerIndex = (nextPlayerIndex + 1) % totalPlayers;
  }

  controlPlayerSpeed(playersToProcess, room);
}
