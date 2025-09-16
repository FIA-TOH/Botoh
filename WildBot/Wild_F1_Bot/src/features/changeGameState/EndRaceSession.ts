import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { getRunningPlayers } from "../utils";
import { gameMode, GameMode } from "./changeGameModes";
import { changeGameStoppedNaturally } from "./gameStopeedNaturally";
import { qualiTime, raceTime } from "./qualy/qualiMode";

export function endRaceSession(
  playersAndDiscs: { p: PlayerObject; disc: DiscPropertiesObject }[],
  room: RoomObject
) {
  const players = getRunningPlayers(playersAndDiscs);
  const scores = room.getScores();

  const shouldStopForNoPlayers =
    scores !== null && players.length === 0 && gameMode !== GameMode.TRAINING;

  const shouldStopForTimeLimit =
    !LEAGUE_MODE &&
    ((gameMode === GameMode.QUALY && scores?.time > qualiTime * 60) ||
      (gameMode === GameMode.RACE && scores?.time > raceTime * 60));

  if (shouldStopForNoPlayers || shouldStopForTimeLimit) {
    changeGameStoppedNaturally(true);
    room.stopGame();
  }
}
