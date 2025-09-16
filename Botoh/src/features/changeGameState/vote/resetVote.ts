import { playerList } from "../../changePlayerState/playerList";
import { selectedCircuits } from "./vote";

export function resetVotes(players: PlayerObject[]) {
  players.forEach((player) => {
    if (playerList[player.id]) playerList[player.id].voted = false;
  });

  selectedCircuits.forEach((circuit) => {
    if (circuit.info) circuit.info.Votes = 0;
  });
}
