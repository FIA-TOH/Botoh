import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { gameMode, GameMode, qualiTime, raceTime } from "./qualiMode";
import { getRunningPlayers } from "../utils";
import { changeGameStoppedNaturally } from "./gameStopeedNaturally";

export function endRaceSession(
  playersAndDiscs: { p: PlayerObject; disc: DiscPropertiesObject }[],
  room: RoomObject
) {
  const players = getRunningPlayers(playersAndDiscs);
  if (
    room.getScores() != null &&
    players.length === 0 &&
    gameMode !== GameMode.TRAINING
  ) {
    changeGameStoppedNaturally(true);
    room.stopGame();
  }
  if (!LEAGUE_MODE) {
    if (
      (gameMode == GameMode.QUALY && room.getScores()?.time > qualiTime * 60) ||
      (gameMode == GameMode.RACE && room.getScores()?.time > raceTime * 60)
    ) {
      changeGameStoppedNaturally(true);
      room.stopGame();
    }
  }
}
