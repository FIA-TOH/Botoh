import { handleGameStateChange } from "../changeGameState/gameState";
import { laps } from "../zones/laps";
import { resetPlayer } from "../changePlayerState/players";
import { finishList, lapPositions } from "../zones/laps/handleLapChange";
import { log } from "../discord/logger";
import { updatePlayerActivity, resetSafetyCarActivationForRace } from "../afk/afk";
import { setCameraAuto } from "../cameraAndBall/cameraFollow";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { checkRunningPlayers } from "../changeGameState/publicGameFlow/startStopGameFlow";
import { GameMode, gameMode } from "../changeGameState/changeGameModes";
import { startWeatherMonitoring } from "../weather/weatherManager";
import { sendInitialWeatherAnnouncement } from "../weather/rain/weatherReportAnnouncer";
import { resetBestPit } from "../tires&pits/trackBestPit";
import { resetBestLap } from "../zones/laps/trackBestLap";
import { clearPlayersLeftInfo } from "../comeBackRace.ts/comeBackToRaceFunctions";
import { clearRRPosition } from "../commands/adminThings/handleRRPositionCommand";
import { decideBlowoutPoint } from "../tires&pits/tireBlowManager";
import { Teams } from "../changeGameState/teams";
import { positionList } from "../commands/gameMode/race/positionList";
import { initBattleRoyale } from "../commands/gameMode/battleRoyale.ts/handleBattleRoyaleLaps";
import { playerList } from "../changePlayerState/playerList";
import { updatePlayerCollision } from "../changePlayerState/updatePlayerCollision";
import { initializeLeagueStartAFKDetection, cleanupLeagueStartAFKDetection } from "../afk/leagueStartAFKDetection";

export function GameStart(room: RoomObject) {
  room.onGameStart = function (byPlayer) {
    byPlayer == null
      ? log(`Game started`)
      : log(`Game started by ${byPlayer.name}`);
    handleGameStateChange("running", room);
    try {
      const fs = require("fs");
      const path = require("path");
      const weatherDir = path.join(__dirname, "../weather");
      const lastWeatherPath = path.join(weatherDir, "lastWeatherId.json");
      if (fs.existsSync(lastWeatherPath)) {
        const lastWeatherData = JSON.parse(fs.readFileSync(lastWeatherPath, "utf-8"));
        if (lastWeatherData.lastWeatherId) {
          startWeatherMonitoring(lastWeatherData.lastWeatherId, room);
          sendInitialWeatherAnnouncement(lastWeatherData.lastWeatherId, room);
        }
      }
    } catch (error) {
      console.error("Failed to load last weather ID:", error);
    }

    if (gameMode !== GameMode.TRAINING) {
      room.startRecording();
    }
    if (gameMode === GameMode.BATTLE_ROYALE) {
      initBattleRoyale(room);
    }
    
    // Initialize league start AFK detection for league mode
    if (LEAGUE_MODE) {
      initializeLeagueStartAFKDetection(room);
    }
    
    resetBestLap();
    resetBestPit();
    clearPlayersLeftInfo();
    clearRRPosition();
    resetSafetyCarActivationForRace();

    setCameraAuto();
    room.getPlayerList().forEach((p) => {
      resetPlayer(p, room, p.id, true);
      updatePlayerActivity(p);
      playerList[p.id].speedEnabled = true;
      if (p.team === Teams.RUNNERS) {
        decideBlowoutPoint(p);
      }
    });
    finishList.splice(0, finishList.length);
    positionList.splice(0, positionList.length);
    for (let i = 0; i < laps; i++) {
      lapPositions[i] = [];
    }
    if (!LEAGUE_MODE) {
      checkRunningPlayers(room);
      // if (gameMode === GameMode.QUALY) {
      //   handleRRAllCommand(room);
      // }
    }
  };
  
}
