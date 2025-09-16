import { room } from "../../room";
import { playerList } from "../changePlayerState/playerList";
import { Teams } from "../changeGameState/teams";

export function moveAllPlayersToTeam(team: Teams) {
  const players = room.getPlayerList();

  players.forEach((p) => {
    const player = playerList[p.id];
    if (!player.afk) {
      room.setPlayerTeam(p.id, team);
    }
  });
}
