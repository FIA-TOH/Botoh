import { updatePositionList } from "../../changeGameState/race/positionList";
import { playerList } from "../../changePlayerState/playerList";
import { sendSuccessMessage, sendAlertMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { LEAGUE_MODE } from "../../hostLeague/leagueMode";
import { getPlayerAndDiscs } from "../../playerFeatures/getPlayerAndDiscs";
import { getRunningPlayers, timerController } from "../../utils";
import { lapPositions, finishList } from "./handleLapChange";

export function handleRaceFinish(
  p: PlayerObject,
  room: RoomObject,
  lapTime: number
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
  room.setPlayerTeam(p.id, 0);

  if (lapPositions[lapPositions.length - 1].length === 1 && !LEAGUE_MODE) {
    timerController.positionTimer = setTimeout(() => {
      getRunningPlayers(playersAndDiscs).forEach((fp) =>
        room.setPlayerTeam(fp.p.id, 0)
      );
      timerController.positionTimer = null;
    }, 30000);
    sendAlertMessage(room, MESSAGES.SECONDS_TO_FINISH(30));
  }
}
