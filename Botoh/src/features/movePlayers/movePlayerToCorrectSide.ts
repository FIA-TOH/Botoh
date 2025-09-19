import { roomPromise } from "../../room";
import { playerList } from "../changePlayerState/playerList";
import { Teams } from "../changeGameState/teams";

export async function movePlayersToCorrectSide() {
  const room = await roomPromise;
  const players = room.getPlayerList();

  const outsidePlayers = players.filter(
    (p: PlayerObject) => p.team === Teams.SPECTATORS
  );
  const otherPlayers = players.filter(
    (p: PlayerObject) => p.team !== Teams.SPECTATORS
  );

  outsidePlayers.forEach((p: PlayerObject) => {
    const player = playerList[p.id];
    if (!player.afk) {
      room.setPlayerTeam(p.id, Teams.RUNNERS);
    }
  });

  otherPlayers.forEach((p: PlayerObject) => {
    const player = playerList[p.id];
    if (!player.afk) {
      room.setPlayerTeam(p.id, Teams.RUNNERS);
    }
  });
}
