import { gameMode, GameMode } from "../changeGameState/changeGameModes";
import { sendQualiResultsToDiscord } from "../discord/logResults";

let lastTrainingLogTime = 0;

export function checkTrainingHourlyLog() {
  if (gameMode !== GameMode.TRAINING) return;

  const now = Date.now();

  if (now - lastTrainingLogTime >= 3600000) {
    lastTrainingLogTime = now;
    sendQualiResultsToDiscord();
  }
}
