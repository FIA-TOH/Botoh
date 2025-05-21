import { log } from "console";
import { sendChatMessage } from "../chat";
import { handleGameStateChange } from "../gameState";
import { setGhostMode } from "../ghost";
import {
  handleRREnabledCommand,
  printAllPositions,
  changeLaps,
} from "../handleCommands";
import { timerController } from "../handleLapChange";
import { LEAGUE_MODE } from "../leagueMode";
import { MESSAGES } from "../messages";
import { resetPlayers } from "../players";
import {
  gameMode,
  GameMode,
  printAllTimes,
  reorderPlayersInRoom,
  changeGameMode,
  clearPlayers,
} from "../qualiMode";
import { resetAllRainEvents, setRainChances } from "../rain";
import { voteSession } from "../vote";
import {
  changeGameStoppedNaturally,
  gameStopedNaturally,
} from "../changeGameState/gameStopeedNaturally";
import { movePlayersToCorrectSide } from "../movePlayers/movePlayerToCorrectSide";

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
