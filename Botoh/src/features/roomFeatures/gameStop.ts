import { handleGameStateChange } from "../changeGameState/gameState";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { resetPlayers } from "../changePlayerState/players";
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
import { timerController } from "../utils";
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
import { resetSessionBestSectors } from "../zones/laps/trackBestSector";
import { resetSandbag } from "../commands/gameMode/battleRoyale.ts/handleSandbag";
import { writeFileSync } from "fs";
import { join } from "path";
import { handleGameStopForRestore } from "./gameStateRestore";
import { handleChangeMap, currentMapIndex, CIRCUITS } from "../zones/maps";

let replayData: Uint8Array | null = null;

// Variável para controlar alternância de circuitos
let circuitToggle = 0;

export function GameStop(room: RoomObject) {
  room.onGameStop = function (byPlayer) {
    // Handle game state restore POC - capture exact state
    handleGameStopForRestore(room);
    
    // Stop weather monitoring
    stopWeatherMonitoring();

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


    if (gameMode !== GameMode.WAITING) {
      if (gameStopedNaturally && !LEAGUE_MODE) {
        // Verifica se estamos alternando circuitos - se sim, não executa PublicGameFlow
        if (byPlayer == null && circuitToggle !== undefined) {
          log("Skipping PublicGameFlow - circuit switching in progress");
        } else {
          PublicGameFlow(room);
        }
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
          room.getPlayerList().forEach(player => {
            resetPitState(player.id);
          });
          handleRREnabledCommand(undefined, ["off"], room);
          sendAllCutsToDiscord();
        } else if (gameMode == GameMode.TRAINING) {
          sendQualiResultsToDiscord();
          printAllTimes(room);
          reorderPlayersInRoomRace(room);
          movePlayersToCorrectSide();
          resetPlayers(room);
          room.getPlayerList().forEach(player => {
            resetPitState(player.id);
          });
          handleRREnabledCommand(undefined, ["off"], room);
        } else {
          sendRaceResultsToDiscord();
          printAllPositions(room);
          movePlayersToCorrectSide();
          resetPlayers(room);
          room.getPlayerList().forEach(player => {
            resetPitState(player.id);
          });
          sendDiscordMessage(room);
          sendAllCutsToDiscord();
        }
      }
      clearPlayers();
  
    }

    handleFlagCommand(undefined, ["reset"], room);
    clearPlayerBuffAndNerfLists();
    clearPlayersLeftInfo();
    clearRRPosition();
    clearCutTrackStorage();
    resetDebrisUsedList();
    resetSessionBestSectors();
    resetSandbag(room);
    
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

    // Alternar automaticamente entre circuitos 0 e 1
    if (byPlayer == null) {
      // Desabilita temporariamente o sistema de restauração para não interferir
      const { disableGameStateRestore } = require("./gameStateRestore");
      disableGameStateRestore();
      
      // Alterna entre 0 e 1
      circuitToggle = circuitToggle === 0 ? 1 : 0;
      const targetCircuit = CIRCUITS[circuitToggle];
      log(`Auto-switching to circuit ${circuitToggle}: ${targetCircuit.info.name}`);
      
      // Troca para o circuito correspondente
      handleChangeMap(circuitToggle, room);
      
      // Verifica se o circuito realmente mudou antes de iniciar (mínimo possível: 1 tick = 16.67ms)
      setTimeout(() => {
        log(`Checking circuit change after 1 tick...`);
        // Verifica se o currentMapIndex corresponde ao circuito que queríamos
        if (currentMapIndex === circuitToggle) {
          log(`Circuit successfully changed to: ${targetCircuit.info.name}`);
          log(`Starting game with circuit ${circuitToggle}`);
          room.startGame();
          log(`Auto-started game with circuit ${circuitToggle}`);
          
          // Aplica estado capturado do jogador imediatamente após iniciar o jogo
          setTimeout(() => {
            const { restorePlayerStates } = require("./gameStateRestore");
            log(`Restoring captured player states...`);
            restorePlayerStates(room);
            log(`Player states restored successfully`);
          }, 0); // Imediato - sem delay para teleporte instantâneo
          
          // Reabilita o sistema de restauração após iniciar o jogo
          setTimeout(() => {
            const { enableGameStateRestore } = require("./gameStateRestore");
            enableGameStateRestore();
          }, 1000);
        } else {
          log(`ERROR: Circuit change failed. Expected ${circuitToggle}, got ${currentMapIndex}`);
          // Tenta novamente
          handleChangeMap(circuitToggle, room);
          setTimeout(() => {
            if (currentMapIndex === circuitToggle) {
              log(`Retry successful: Circuit changed to ${targetCircuit.info.name}`);
              room.startGame();
              
              // Aplica estado capturado do jogador imediatamente após iniciar o jogo
              setTimeout(() => {
                const { restorePlayerStates } = require("./gameStateRestore");
                log(`Restoring captured player states...`);
                restorePlayerStates(room);
                log(`Player states restored successfully`);
              }, 0); // Imediato - sem delay para teleporte instantâneo
              
              // Reabilita o sistema de restauração
              setTimeout(() => {
                const { enableGameStateRestore } = require("./gameStateRestore");
                enableGameStateRestore();
              }, 1000);
            } else {
              log(`ERROR: Circuit change failed twice. Giving up.`);
              // Reabilita mesmo assim
              const { enableGameStateRestore } = require("./gameStateRestore");
              enableGameStateRestore();
            }
          }, 1000);
        }
      }, 16); // 16ms = 1 tick a 60fps (mínimo possível)
    }
  };
}
