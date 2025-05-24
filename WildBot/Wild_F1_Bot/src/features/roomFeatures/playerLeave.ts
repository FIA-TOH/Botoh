import { sha256 } from "js-sha256";
import { afkAdmins } from "../afk/afkAdmins";
import { lapPositions } from "../zones/handleLapChange";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { playerList } from "../changePlayerState/playerList";
import { getRunningPlayers } from "../utils";
import { getPlayerAndDiscs } from "../playerFeatures/getPlayerAndDiscs";
import { gameMode, GameMode } from "../changeGameState/changeGameModes";

export function PlayerLeave(room: RoomObject) {
  room.onPlayerLeave = function (player) {
    if (player.admin) delete afkAdmins[player.id];

    const playerObj = playerList[player.id];

    if (LEAGUE_MODE) {
      const hash = playerObj !== undefined ? sha256(playerObj.ip) : "";
      console.log(`${player.name} has left. (${hash})`);
    } else {
      const ip = playerObj !== undefined ? playerObj.ip : "";
      console.log(`${player.name} has left. (${ip})`);
    }

    for (let i = 0; i < lapPositions.length; i++) {
      for (let j = 0; j < lapPositions[i].length; j++) {
        if (lapPositions[i][j].name === player.name) {
          lapPositions[i].splice(j, 1);
          break;
        }
      }
    }

    const playersAndDiscs = getPlayerAndDiscs(room);

    if (
      room.getScores() != null &&
      getRunningPlayers(playersAndDiscs).length === 0 &&
      gameMode !== GameMode.TRAINING
    ) {
      room.stopGame();
    }
  };
}
