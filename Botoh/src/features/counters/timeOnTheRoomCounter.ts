import { gameMode, GameMode } from "../changeGameState/changeGameModes";
import { maxQualyTime } from "../commands/gameMode/qualy/hardQualyFunctions";

export function hasQualyTimeEnded(room: RoomObject): boolean {
  if (gameMode !== GameMode.HARD_QUALY) return false;

  const scores = room.getScores();
  if (!scores) return false;

  return scores.time >= maxQualyTime;
}
