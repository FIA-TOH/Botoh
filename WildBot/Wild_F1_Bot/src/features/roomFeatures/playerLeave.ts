import { sha256 } from "js-sha256";
import { afkAdmins } from "../afk/afkAdmins";
import { lapPositions } from "../zones/laps/handleLapChange";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { playerList } from "../changePlayerState/playerList";
import { getRunningPlayers } from "../utils";
import { getPlayerAndDiscs } from "../playerFeatures/getPlayerAndDiscs";
import { gameMode, GameMode } from "../changeGameState/changeGameModes";
import { log } from "../discord/logger";
import { updatePlayerActivity } from "../afk/afk";
import { followPlayerId } from "../camera/cameraFollow";
import { checkRunningPlayers } from "../changeGameState/publicGameFlow/startStopGameFlow";
import { changeGameStoppedNaturally } from "../changeGameState/gameStopeedNaturally";

export function PlayerLeave(room: RoomObject) {
  room.onPlayerLeave = function (player) {
    if (player.admin) delete afkAdmins[player.id];
    updatePlayerActivity(player);

    const playerObj = playerList[player.id];

    if (LEAGUE_MODE) {
      const hash = playerObj !== undefined ? sha256(playerObj.ip) : "";
      log(`${player.name} has left. (${hash})`);
    } else {
      const ip = playerObj !== undefined ? playerObj.ip : "";
      log(`${player.name} has left. (${ip})`);
      checkRunningPlayers(room);
    }

    for (let i = 0; i < lapPositions.length; i++) {
      for (let j = 0; j < lapPositions[i].length; j++) {
        if (lapPositions[i][j].name === player.name) {
          lapPositions[i].splice(j, 1);
          break;
        }
      }
    }

    if (player.id === followPlayerId && playerObj?.cameraFollowing) {
    } else {
      const playersAndDiscs = getPlayerAndDiscs(room);
      if (
        room.getScores() != null &&
        getRunningPlayers(playersAndDiscs).length === 0 &&
        gameMode !== GameMode.TRAINING
      ) {
        changeGameStoppedNaturally(false);
        room.stopGame();
      }
    }
  };
}
