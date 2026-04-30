import { sha256 } from "js-sha256";
import { afkAdmins } from "../afk/afkAdmins";
import { lapPositions } from "../zones/laps/handleLapChange";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { idToAuth, playerList } from "../changePlayerState/playerList";
import { getRunningPlayers } from "../utils";
import { getPlayerAndDiscs } from "../playerFeatures/getPlayerAndDiscs";
import {
  gameMode,
  GameMode,
  generalGameMode,
  GeneralGameMode,
} from "../changeGameState/changeGameModes";
import { log } from "../discord/logger";
import { updatePlayerActivity, handlePlayerLeave } from "../afk/afk";
import { followPlayerId } from "../cameraAndBall/cameraFollow";
import { checkRunningPlayers } from "../changeGameState/publicGameFlow/startStopGameFlow";
import { changeGameStoppedNaturally } from "../changeGameState/gameStopeedNaturally";
import { sendQualiResultsToDiscord } from "../discord/logResults";
import { getPlayerByRacePosition } from "../playerFeatures/getPlayerBy";
import { sendDiscordGeneralChatQualy } from "../discord/discord";
import { rejoinManager } from "../changePlayerState/rejoinManager";

export function PlayerLeave(room: RoomObject) {
  room.onPlayerLeave = function (player) {
    if (player.admin) delete afkAdmins[player.id];
    updatePlayerActivity(player);
    handlePlayerLeave(player, room);

    const playerObj = playerList[player.id];
    const firstPlacePlayer = getPlayerByRacePosition("first", room);
    const firstPlacePlayerLap = firstPlacePlayer
      ? playerList[firstPlacePlayer.id].currentLap
      : 0;

    const lapsCompleted = Math.max(0, (playerList[player.id]?.currentLap || 1) - 1);

    if (generalGameMode === GeneralGameMode.GENERAL_RACE && playerObj) {
      const playerAuth = idToAuth[player.id] || player.auth;
      
      let position = { x: 0, y: 0 };
      if (playerObj.previousPos && playerObj.previousPos.x !== null && playerObj.previousPos.y !== null) {
        position = {
          x: playerObj.previousPos.x,
          y: playerObj.previousPos.y
        };
      }
      
      if (playerAuth) {
        rejoinManager.savePlayerData(playerAuth, playerObj, position);
      }
    }

    if (LEAGUE_MODE) {
      if (gameMode === GameMode.HARD_QUALY && player.name !== "Admin") {
        sendDiscordGeneralChatQualy(`${player.name} has left the qualy room!`);
      }
    } else {
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
    if (gameMode === GameMode.HARD_QUALY) {
      if (room.getPlayerList().length <= 1) {
        room.setPassword(null);
      }
      playerObj.didHardQualy = true;

      sendQualiResultsToDiscord();
    }
    if (player.id === followPlayerId && playerObj?.cameraFollowing) {
    } else {
      const playersAndDiscs = getPlayerAndDiscs(room);
      if (
        room.getScores() != null &&
        getRunningPlayers(playersAndDiscs).length === 0 &&
        gameMode !== GameMode.TRAINING &&
        gameMode !== GameMode.HARD_QUALY
      ) {
        changeGameStoppedNaturally(false);
        room.stopGame();
      }
    }
  };
}
