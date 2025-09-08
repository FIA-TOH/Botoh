import { sendChatMessage } from "../chat/chat";
import { handleGameStateChange } from "../changeGameState/gameState";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { MESSAGES } from "../chat/messages";
import { resetPlayers } from "../changePlayerState/players";

import { rainEnabled, resetAllRainEvents, setRainChances } from "../rain/rain";
import {
  changeGameStoppedNaturally,
  gameStopedNaturally,
} from "../changeGameState/gameStopeedNaturally";
import { movePlayersToCorrectSide } from "../movePlayers/movePlayerToCorrectSide";
import { setGhostMode } from "../changePlayerState/ghost";
import {
  gameMode,
  GameMode,
  changeGameMode,
} from "../changeGameState/changeGameModes";
import { clearPlayers } from "../changeGameState/qualy/playerTime";
import { printAllTimes } from "../changeGameState/qualy/printAllTimes";
import { reorderPlayersInRoomRace } from "../movePlayers/reorderPlayersInRoom";
import { timerController } from "../utils";
import { printAllPositions } from "../changeGameState/race/printAllPositions";
import { log } from "../discord/logger";
import { changeLaps } from "../commands/adminThings/handleChangeLaps";
import { handleRREnabledCommand } from "../commands/adminThings/handleRREnabledCommand";
import { handleFlagCommand } from "../commands/flagsAndVSC/handleFlagCommand";
import { clearPlayerBuffAndNerfLists } from "../commands/adjustThings/handleNerfListCommand";
import PublicGameFlow from "../changeGameState/publicGameFlow/publicGameFLow";
import { sendDiscordReplay } from "../discord/discord";
import {
  sendQualiResultsToDiscord,
  sendRaceResultsToDiscord,
} from "../discord/logResults";

export function GameStop(room: RoomObject) {
  room.onGameStop = function (byPlayer) {
    if (byPlayer == null) {
      log(`Game stopped`);
    } else {
      changeGameStoppedNaturally(false);
      log(`Game stopped by ${byPlayer.name}`);
    }
    handleGameStateChange(null, room);
    if (gameMode !== GameMode.TRAINING) {
      const replay = room.stopRecording();
      if (replay) {
        sendDiscordReplay(replay);
      }
    }

    if (timerController.positionTimer !== null) {
      clearTimeout(timerController.positionTimer);
      timerController.positionTimer = null;
      log("Temporizer canceled by onGameStop");
    }

    resetAllRainEvents();
    if (gameMode !== GameMode.WAITING) {
      if (gameStopedNaturally && !LEAGUE_MODE) {
        PublicGameFlow(room);
        changeGameStoppedNaturally(false);
      } else {
        handleGameStateChange(null, room);
        if (gameMode == GameMode.QUALY) {
          sendQualiResultsToDiscord();
          printAllTimes(room);
          reorderPlayersInRoomRace(room);
          movePlayersToCorrectSide();
          changeGameMode(GameMode.RACE, room);
          changeLaps("7", undefined, room);
          resetPlayers(room);
          setGhostMode(room, false);
          handleRREnabledCommand(undefined, ["false"], room);
        } else if (gameMode == GameMode.TRAINING) {
          sendQualiResultsToDiscord();
          printAllTimes(room);
          reorderPlayersInRoomRace(room);
          movePlayersToCorrectSide();
          resetPlayers(room);
          setGhostMode(room, false);
          handleRREnabledCommand(undefined, ["false"], room);
        } else {
          sendRaceResultsToDiscord();
          printAllPositions(room);
          movePlayersToCorrectSide();
          resetPlayers(room);
          sendChatMessage(room, MESSAGES.DISCORD_INVITE());
        }
      }
      clearPlayers();
      if (rainEnabled) {
        setRainChances(0);
      }
    }

    handleFlagCommand(undefined, ["reset"], room);
    clearPlayerBuffAndNerfLists();
  };
}
