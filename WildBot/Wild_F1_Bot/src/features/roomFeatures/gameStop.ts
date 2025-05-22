import { log } from "console";
import { sendChatMessage } from "../chat/chat";
import { handleGameStateChange } from "../changeGameState/gameState";
import {
  handleRREnabledCommand,
  printAllPositions,
  changeLaps,
} from "../commands/handleCommands";
import { timerController } from "../zones/handleLapChange";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { MESSAGES } from "../chat/messages";
import { resetPlayers } from "../changePlayerState/players";
import {
  gameMode,
  GameMode,
  printAllTimes,
  reorderPlayersInRoom,
  changeGameMode,
  clearPlayers,
} from "../changeGameState/qualiMode";
import { resetAllRainEvents, setRainChances } from "../rain/rain";
import { voteSession } from "../changeGameState/vote";
import {
  changeGameStoppedNaturally,
  gameStopedNaturally,
} from "../changeGameState/gameStopeedNaturally";
import { movePlayersToCorrectSide } from "../movePlayers/movePlayerToCorrectSide";
import { setGhostMode } from "../changePlayerState/ghost";

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
