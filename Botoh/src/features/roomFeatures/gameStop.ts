import { handleGameStateChange } from "../changeGameState/gameState";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { resetPlayers } from "../changePlayerState/players";
import { clearAllPreparedPitTires } from "../changePlayerState/playerList";
import { cleanupLeagueStartAFKDetection } from "../afk/leagueStartAFKDetection";
import { resetAllAfkCounters } from "../afk/afk";
import { resetVSCState } from "../safetyCar/vsc";
import { resetPitState } from "../tires&pits/newPitSystem/newPitManager";


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
import { delay, timerController } from "../utils";
import { stopWeatherMonitoring } from "../weather/weatherManager";

import { log } from "../discord/logger";
import { changeLaps } from "../commands/adminThings/handleChangeLaps";
import { handleRREnabledCommand } from "../commands/adminThings/handleRREnabledCommand";
import { handleFlagCommand } from "../commands/flagsAndVSC/handleFlagCommand";
import { handleSCCommand } from "../commands/flagsAndVSC/handleSCCommand";
import { clearPlayerBuffAndNerfLists } from "../commands/adjustThings/handleNerfListCommand";
import PublicGameFlow from "../changeGameState/publicGameFlow/publicGameFLow";
import { sendDiscordReplay } from "../discord/discord";
import {
  sendQualiResultsToDiscord,
  sendRaceResultsToDiscord,
} from "../discord/logResults";
import { gameStarted, setGameStarted } from "./gameTick";
import { sendDiscordMessage } from "../discord/sendDiscordLink";
import { clearRRPosition } from "../commands/adminThings/rrPositionState";
import { rejoinManager } from "../changePlayerState/rejoinManager";
import {
  clearCutTrackStorage,
  sendAllCutsToDiscord,
} from "../detectCut/cutsOfTracksStorage";
import {
  clearCrashWallLogs,
  sendAllCrashWallLogsToDiscord,
} from "../speed/crashWallLogStorage";
import { resetDebrisUsedList } from "../debris/chooseOneDebris";
import { clearPlayers } from "../commands/gameMode/qualy/playerTime";
import { printAllTimes } from "../commands/gameMode/qualy/printAllTimes";
import { printAllPositions } from "../commands/gameMode/race/printAllPositions";
import { resetSessionBestSectors } from "../zones/laps/trackBestSector";
import { DEFAULT_LAPS, resetCurrentSessionLap } from "../zones/laps";
import { resetSandbag } from "../commands/gameMode/battleRoyale.ts/handleSandbag";
import { writeFileSync } from "fs";
import { join } from "path";
import { resetLapHistory } from "../zones/laps/lapHistory";
import {
  sendDeferredPublicCompetitionNotifications,
  settlePublicQualyRanking,
  settlePublicRaceChampionship,
} from "../public/publicCompetition";

let replayData: Uint8Array | null = null;

export function GameStop(room: RoomObject) {
  room.onGameStop = async function (byPlayer) {
    stopWeatherMonitoring();
    clearAllPreparedPitTires();

    if (byPlayer == null) {
      log(`Game stopped`);
    } else {
      changeGameStoppedNaturally(false);
      log(`Game stopped by ${byPlayer.name}`);
    }

    handleGameStateChange(null, room);
    let replayToSend: Uint8Array | null = null;
    if (gameMode !== GameMode.TRAINING) {
      replayData = room.stopRecording();
      if (replayData && gameStarted) {
        replayToSend = replayData;
      } else {
        log("Replay discarted");
      }
    }
    setGameStarted(false);

    if (timerController.positionTimer !== null) {
      clearTimeout(timerController.positionTimer);
      timerController.positionTimer = null;
      log("Temporizer canceled by onGameStop");
    }


    if (gameMode !== GameMode.WAITING) {
      if (gameStopedNaturally && !LEAGUE_MODE) {
        if (room.getPlayerList().length > 0) {
          await PublicGameFlow(room);
        }
        changeGameStoppedNaturally(false);
      } else {
        handleGameStateChange(null, room);
        if (generalGameMode === GeneralGameMode.GENERAL_QUALY) {
          const qualyNotifications = !LEAGUE_MODE
            ? await settlePublicQualyRanking(room, { deferMessages: true })
            : [];
          await sendQualiResultsToDiscord();
          printAllTimes(room);
          if (!LEAGUE_MODE) {
            await delay(2);
            sendDeferredPublicCompetitionNotifications(room, qualyNotifications);
          }
          reorderPlayersInRoomRace(room);
          movePlayersToCorrectSide();
          changeGameMode(GameMode.RACE, room, { reloadStadium: false });
          changeLaps(String(DEFAULT_LAPS), undefined, room);
          resetPlayers(room);
          room.getPlayerList().forEach(player => {
            resetPitState(player.id);
          });
          handleRREnabledCommand(undefined, ["off"], room);
          sendAllCutsToDiscord();
          sendAllCrashWallLogsToDiscord();
        } else if (gameMode == GameMode.TRAINING) {
          await sendQualiResultsToDiscord();
          printAllTimes(room);
          reorderPlayersInRoomRace(room);
          movePlayersToCorrectSide();
          resetPlayers(room);
          room.getPlayerList().forEach(player => {
            resetPitState(player.id);
          });
          handleRREnabledCommand(undefined, ["off"], room);
        } else {
          const raceNotifications = !LEAGUE_MODE
            ? await settlePublicRaceChampionship(room, { deferMessages: true })
            : [];
          await sendRaceResultsToDiscord();
          printAllPositions(room);
          if (!LEAGUE_MODE) {
            await delay(2);
            sendDeferredPublicCompetitionNotifications(room, raceNotifications);
          }
          movePlayersToCorrectSide();
          resetPlayers(room);
          room.getPlayerList().forEach(player => {
            resetPitState(player.id);
          });
          sendAllCutsToDiscord();
          sendAllCrashWallLogsToDiscord();
          setTimeout(() => {
            sendDiscordMessage(room);
          }, 3000);
        }
      }
      if (replayToSend) {
        await sendDiscordReplay(replayToSend);
      }
      clearPlayers();
  
    }

    handleFlagCommand(undefined, ["reset"], room);
    clearPlayerBuffAndNerfLists();
    clearRRPosition();
    clearCutTrackStorage();
    clearCrashWallLogs();
    resetDebrisUsedList();
    resetSessionBestSectors();
    resetCurrentSessionLap();
    resetSandbag(room);
    resetLapHistory();
    
    if (generalGameMode === GeneralGameMode.GENERAL_RACE) {
      rejoinManager.clearAllData();
    }
    
    handleSCCommand(undefined, ["off"], room);
    
    cleanupLeagueStartAFKDetection();
    
    resetAllAfkCounters(room);
    
    resetVSCState();
    
    try {
      const weatherDir = join(__dirname, "../weather");
      const lastWeatherPath = join(weatherDir, "lastWeatherId.json");
      writeFileSync(lastWeatherPath, JSON.stringify({ lastWeatherId: null }));
    } catch (error) {
      console.error("Failed to reset lastWeatherId:", error);
    }
  };
}
