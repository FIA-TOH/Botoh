import { sha256 } from "js-sha256";
import { afkAdmins } from "../afkAdmins";
import { lapPositions } from "../handleLapChange";
import { LEAGUE_MODE } from "../leagueMode";
import { playerList } from "../playerList";
import { gameMode, GameMode } from "../qualiMode";
import { getRunningPlayers } from "../utils";

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

    const playersAndDiscs = room.getPlayerList().map((p) => {
      return { p: p, disc: room.getPlayerDiscProperties(p.id) };
    });

    if (
      room.getScores() != null &&
      getRunningPlayers(playersAndDiscs).length === 0 &&
      gameMode !== GameMode.TRAINING
    ) {
      room.stopGame();
    }
  };
}
