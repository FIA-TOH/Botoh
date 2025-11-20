import { sha256 } from "js-sha256";
import { afkAdmins } from "../afk/afkAdmins";
import { lapPositions } from "../zones/laps/handleLapChange";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { playerList } from "../changePlayerState/playerList";
import { getRunningPlayers } from "../utils";
import { getPlayerAndDiscs } from "../playerFeatures/getPlayerAndDiscs";
import {
  gameMode,
  GameMode,
  generalGameMode,
  GeneralGameMode,
} from "../changeGameState/changeGameModes";
import { log } from "../discord/logger";
import { updatePlayerActivity } from "../afk/afk";
import { followPlayerId } from "../cameraAndBall/cameraFollow";
import { checkRunningPlayers } from "../changeGameState/publicGameFlow/startStopGameFlow";
import { changeGameStoppedNaturally } from "../changeGameState/gameStopeedNaturally";
import { sendQualiResultsToDiscord } from "../discord/logResults";
import { addPlayerLeftInfo } from "../comeBackRace.ts/comeBackToRaceFunctions";
import { getPlayerByRacePosition } from "../playerFeatures/getPlayerBy";
import { sendDiscordGeneralChatQualy } from "../discord/discord";

export function PlayerLeave(room: RoomObject) {
  room.onPlayerLeave = function (player) {
    if (player.admin) delete afkAdmins[player.id];
    updatePlayerActivity(player);

    const playerObj = playerList[player.id];
    const firstPlacePlayer = getPlayerByRacePosition("first", room);
    const firstPlacePlayerLap = firstPlacePlayer
      ? playerList[firstPlacePlayer.id].currentLap
      : 0;

    const lapsCompleted = Math.max(0, playerList[player.id].currentLap - 1);

    if (LEAGUE_MODE) {
      const hash = playerObj !== undefined ? sha256(playerObj.ip) : "";
      log(`${player.name} has left. (${hash})`);
      if (gameMode === GameMode.HARD_QUALY && player.name !== "Admin") {
        sendDiscordGeneralChatQualy(`${player.name} has left the qualy room!`);
      }

      if (
        generalGameMode === GeneralGameMode.GENERAL_RACE &&
        room.getScores()?.time > 0 &&
        playerObj
      ) {
        const playerLeft = {
          id: player.id,
          name: player.name,
          ip: playerObj.ip,
          leagueTeam: playerObj.leagueTeam,
          didHardQualy: playerObj.didHardQualy,
          totalTime: playerObj.totalTime,
          bestTime: playerObj.bestTime,
          tires: playerObj.tires,
          wear: playerObj.wear,
          lapsOnCurrentTire: playerObj.lapsOnCurrentTire,
          showTires: playerObj.showTires,
          maxSpeed: playerObj.maxSpeed,
          pits: playerObj.pits,
          pitTargetTires: playerObj.pitTargetTires,
          pitFailures: playerObj.pitFailures,
          pitInitialPos: playerObj.pitInitialPos,
          speedEnabled: playerObj.speedEnabled,
          kers: playerObj.kers,
          gas: playerObj.gas,
          prevGas: playerObj.prevGas,
          language: playerObj.language,
          everyoneLaps: playerObj.everyoneLaps,
          voted: playerObj.voted,
          lapsBehindLeaderWhenLeft: Math.max(
            0,
            firstPlacePlayerLap - playerObj.currentLap
          ),
          lapsCompletedWhenLeft: lapsCompleted,

          leftAt: new Date().toISOString(),
        };
        // console.log(
        //   "LEFT SAVE",
        //   player.name,
        //   "lapsCompletedWhenLeft",
        //   lapsCompleted,
        //   "lapsBehind",
        //   playerObj.currentLap - firstPlacePlayerLap
        // );

        addPlayerLeftInfo(playerLeft);
      }
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
