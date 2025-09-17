import { roomPromise } from "../../room";
import { playerList } from "../changePlayerState/playerList";
import { Teams } from "../changeGameState/teams";

export async function moveAllPlayersToTeam(team: Teams) {
  const room = await roomPromise;
  const players = room.getPlayerList();

  players.forEach((p: PlayerObject) => {
    const player = playerList[p.id];
    if (!player.afk) {
      room.setPlayerTeam(p.id, team);
    }
  });
}
