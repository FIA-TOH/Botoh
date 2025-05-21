import { room } from "../../room";
import { playerList } from "../playerList";
import { Teams } from "../teams";

export function movePlayersToCorrectSide() {
  const players = room.getPlayerList();

  const outsidePlayers = players.filter((p) => p.team === Teams.SPECTATORS);
  const otherPlayers = players.filter((p) => p.team !== Teams.SPECTATORS);

  outsidePlayers.forEach((p) => {
    const player = playerList[p.id];
    if (!player.afk) {
      console.log(p.name);

      room.setPlayerTeam(p.id, Teams.RUNNERS);
    }
  });

  otherPlayers.forEach((p) => {
    const player = playerList[p.id];
    if (!player.afk) {
      console.log(p.name);
      room.setPlayerTeam(p.id, Teams.RUNNERS);
    }
  });
}
