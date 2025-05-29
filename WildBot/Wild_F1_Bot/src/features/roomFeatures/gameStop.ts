import { sendChatMessage } from "../chat/chat";
import { handleGameStateChange } from "../changeGameState/gameState";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { MESSAGES } from "../chat/messages";
import { resetPlayers } from "../changePlayerState/players";

import { resetAllRainEvents, setRainChances } from "../rain/rain";
import { voteSession } from "../changeGameState/vote/vote";
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
import { reorderPlayersInRoom } from "../movePlayers/reorderPlayersInRoom";
import { timerController } from "../utils";
import { printAllPositions } from "../changeGameState/race/printAllPositions";
import { log } from "../discord/logger";
import { changeLaps } from "../commands/adminThings/handleChangeLaps";
import { handleRREnabledCommand } from "../commands/adminThings/handleRREnabledCommand";

export function GameStop(room: RoomObject) {
  room.onGameStop = function (byPlayer) {
    byPlayer == null
      ? log(`Game stopped`)
      : log(`Game stopped by ${byPlayer.name}`);

    handleGameStateChange(null);
    resetAllRainEvents();

    if (gameStopedNaturally && !LEAGUE_MODE) {
      if (gameMode == GameMode.QUALY) {
        printAllTimes(room);
        room.stopGame();
        reorderPlayersInRoom(room);
        movePlayersToCorrectSide();
        setTimeout(() => {
          changeGameMode(GameMode.RACE, room);
          resetPlayers(room);
          setGhostMode(room, false);
          handleRREnabledCommand(undefined, ["false"], room);
          sendChatMessage(room, MESSAGES.EXPLAIN_TYRES());
          sendChatMessage(room, MESSAGES.EXPLAIN_ERS());
          setTimeout(() => {
            room.startGame();
          }, 5000);
        }, 5000);
      } else {
        room.stopGame();
        printAllPositions(room);
        movePlayersToCorrectSide();
        sendChatMessage(room, MESSAGES.DISCORD_INVITE());
        voteSession(room);
      }
      changeGameStoppedNaturally(false);
    } else {
      if (gameMode == GameMode.QUALY) {
        printAllTimes(room);
        reorderPlayersInRoom(room);
        movePlayersToCorrectSide();
        changeGameMode(GameMode.RACE, room);
        changeLaps("7", undefined, room);
        resetPlayers(room);
        setGhostMode(room, false);
      } else if (gameMode == GameMode.TRAINING) {
        printAllTimes(room);
        reorderPlayersInRoom(room);
        movePlayersToCorrectSide();
        resetPlayers(room);
      } else {
        printAllPositions(room);
        movePlayersToCorrectSide();
        resetPlayers(room);
      }
    }
    clearPlayers();
    setRainChances(0);
    if (timerController.positionTimer !== null) {
      clearTimeout(timerController.positionTimer);
      timerController.positionTimer = null;
      log("Temporizador cancelado por onGameStop");
    }
  };
}
