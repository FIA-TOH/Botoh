import { Teams } from "../../changeGameState/teams";
import { playerList } from "../../changePlayerState/playerList";
import { sendSuccessMessage, sendAlertMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { updatePositionList } from "../../commands/gameMode/race/positionList";
import { LEAGUE_MODE } from "../../hostLeague/leagueMode";
import { getPlayerAndDiscs } from "../../playerFeatures/getPlayerAndDiscs";
import { getRunningPlayers, timerController } from "../../utils";
import { lapPositions, finishList } from "./handleLapChange";

const SECONDS_AFTER_FIRST_END = 30;

export function handleRaceFinish(
  p: PlayerObject,
  room: RoomObject,
  lapTime: number,
  isWinner: boolean,
) {
  const playersAndDiscs = getPlayerAndDiscs(room);
  const fullTime =
    lapPositions.reduce((acc, curr) => {
      const time = curr.find((c) => c.id === p.id)?.time ?? 0;
      return acc + time;
    }, 0) + lapTime;

  finishList.push({
    name: p.name,
    pits: playerList[p.id].pits.pitsNumber,
    time: playerList[p.id].bestTime,
    fullTime: fullTime,
  });

  sendSuccessMessage(room, MESSAGES.FINISH_RACE(), p.id);
  playerList[p.id].totalTime = room.getScores().time;
  updatePositionList(getRunningPlayers(playersAndDiscs), room);
  room.setPlayerTeam(p.id, Teams.SPECTATORS);

  if (isWinner && !LEAGUE_MODE) {
    sendAlertMessage(room, MESSAGES.SECONDS_TO_FINISH(SECONDS_AFTER_FIRST_END));
    timerController.positionTimer = setTimeout(() => {
      getRunningPlayers(playersAndDiscs).forEach((fp) =>
        room.setPlayerTeam(fp.p.id, Teams.SPECTATORS),
      );
      timerController.positionTimer = null;
    }, SECONDS_AFTER_FIRST_END * 1000);
  }
}
