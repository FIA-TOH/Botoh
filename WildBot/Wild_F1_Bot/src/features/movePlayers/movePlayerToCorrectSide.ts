import { room } from "../../room";
import { playerList } from "../changePlayerState/playerList";
import { Teams } from "../changeGameState/teams";

export function movePlayersToCorrectSide() {
  const players = room.getPlayerList();

  const outsidePlayers = players.filter((p) => p.team === Teams.SPECTATORS);
  const otherPlayers = players.filter((p) => p.team !== Teams.SPECTATORS);

  outsidePlayers.forEach((p) => {
    const player = playerList[p.id];
    if (!player.afk) {
      room.setPlayerTeam(p.id, Teams.RUNNERS);
    }
  });

  otherPlayers.forEach((p) => {
    const player = playerList[p.id];
    if (!player.afk) {
      room.setPlayerTeam(p.id, Teams.RUNNERS);
    }
  });
}
