import { qualiTime, raceTime } from "../commands/gameMode/qualy/qualiMode";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { getRunningPlayers } from "../utils";
import {
  gameMode,
  GameMode,
  GeneralGameMode,
  generalGameMode,
} from "./changeGameModes";
import { changeGameStoppedNaturally } from "./gameStopeedNaturally";

export function endRaceSession(
  playersAndDiscs: { p: PlayerObject; disc: DiscPropertiesObject }[],
  room: RoomObject,
) {
  const players = getRunningPlayers(playersAndDiscs);
  const scores = room.getScores();

  const shouldStopForNoPlayers =
    scores !== null &&
    players.length === 0 &&
    gameMode !== GameMode.TRAINING &&
    gameMode !== GameMode.HARD_QUALY;

  const shouldStopForTimeLimit =
    !LEAGUE_MODE &&
    ((generalGameMode === GeneralGameMode.GENERAL_QUALY &&
      scores?.time > qualiTime * 60) ||
      (generalGameMode === GeneralGameMode.GENERAL_RACE &&
        scores?.time > raceTime * 60));

  if (shouldStopForNoPlayers || shouldStopForTimeLimit) {
    changeGameStoppedNaturally(true);
    room.stopGame();
  }
}
