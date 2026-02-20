import { handleGameStateChange } from "../changeGameState/gameState";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { resetPlayers } from "../changePlayerState/players";

// import { rainEnabled, resetAllRainEvents, setRainChances } from "../rain/rain";
import {
  changeGameStoppedNaturally,
  gameStopedNaturally,
} from "../changeGameState/gameStopeedNaturally";
import { movePlayersToCorrectSide } from "../movePlayers/movePlayerToCorrectSide";
import {
  gameMode,
  GameMode,
  changeGameMode,
  generalGameMode,
  GeneralGameMode,
} from "../changeGameState/changeGameModes";

import { reorderPlayersInRoomRace } from "../movePlayers/reorderPlayersInRoom";
import { timerController } from "../utils";

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
import { gameStarted, setGameStarted } from "./gameTick";
import { sendDiscordMessage } from "../discord/sendDiscordLink";
import { clearPlayersLeftInfo } from "../comeBackRace.ts/comeBackToRaceFunctions";
import { clearRRPosition } from "../commands/adminThings/handleRRPositionCommand";
import {
  clearCutTrackStorage,
  sendAllCutsToDiscord,
} from "../detectCut/cutsOfTracksStorage";
import { resetDebrisUsedList } from "../debris/chooseOneDebris";
import { clearPlayers } from "../commands/gameMode/qualy/playerTime";
import { printAllTimes } from "../commands/gameMode/qualy/printAllTimes";
import { printAllPositions } from "../commands/gameMode/race/printAllPositions";
import { exportAllLapTimesCsv } from "../changePlayerState/lapRecorder";
import { sendFileToWebhook } from "../discord/discord";

let replayData: Uint8Array | null = null;

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
      replayData = room.stopRecording();
      if (replayData && gameStarted) {
        sendDiscordReplay(replayData);
      } else {
        log("Replay discarted");
      }
    }
    setGameStarted(false);

    try {
      const csvPath = exportAllLapTimesCsv(room);
      if (csvPath) log(`Lap times exported: ${csvPath}`);
    } catch (err) {
      log("Error exporting lap times: " + String(err));
    }

    try {
      const WEBHOOK =
        "https://discord.com/api/webhooks/1445546615715921992/6Z4h19srHYhvwr4tVggs_mms0C85BiiCNuqeJQhv7dTm-jc6s5NbYbTQshVVMI3z-6_J";
      const csvPath = exportAllLapTimesCsv(room);
      if (csvPath) {
        sendFileToWebhook(csvPath, WEBHOOK, "LAP_TIMES_CSV");
        log(`Lap CSV sent to webhook`);
      }
    } catch (err) {
      log("Error sending lap CSV to webhook: " + String(err));
    }

    if (timerController.positionTimer !== null) {
      clearTimeout(timerController.positionTimer);
      timerController.positionTimer = null;
      log("Temporizer canceled by onGameStop");
    }

    // if (positionList.length > 0) {
    //   const fileName = `RaceResults-${getTimestamp()}.json`;

    //   sendDiscordFile(positionList, fileName, "RACE_RESULTS");
    // }
    // const qualiResults = getPlayersOrderedByQualiTime();
    // if (qualiResults.length > 0) {
    //   const fileName = `QualiResults-${getTimestamp()}.json`;

    //   sendDiscordFile(qualiResults, fileName, "QUALI_RESULTS");
    // }

    // resetAllRainEvents();
    if (gameMode !== GameMode.WAITING) {
      if (gameStopedNaturally && !LEAGUE_MODE) {
        PublicGameFlow(room);
        changeGameStoppedNaturally(false);
      } else {
        handleGameStateChange(null, room);
        if (generalGameMode === GeneralGameMode.GENERAL_QUALY) {
          sendQualiResultsToDiscord();
          printAllTimes(room);
          reorderPlayersInRoomRace(room);
          movePlayersToCorrectSide();
          changeGameMode(GameMode.RACE, room);
          changeLaps("7", undefined, room);
          resetPlayers(room);
          handleRREnabledCommand(undefined, ["false"], room);
          sendAllCutsToDiscord();
        } else if (gameMode == GameMode.TRAINING) {
          sendQualiResultsToDiscord();
          printAllTimes(room);
          reorderPlayersInRoomRace(room);
          movePlayersToCorrectSide();
          resetPlayers(room);
          handleRREnabledCommand(undefined, ["false"], room);
        } else {
          sendRaceResultsToDiscord();
          printAllPositions(room);
          movePlayersToCorrectSide();
          resetPlayers(room);
          sendDiscordMessage(room);
          sendAllCutsToDiscord();
        }
      }
      clearPlayers();
      // if (rainEnabled) {
      //   setRainChances(0);
      // }
    }

    handleFlagCommand(undefined, ["reset"], room);
    clearPlayerBuffAndNerfLists();
    clearPlayersLeftInfo();
    clearRRPosition();
    clearCutTrackStorage();
    resetDebrisUsedList();
  };
}
