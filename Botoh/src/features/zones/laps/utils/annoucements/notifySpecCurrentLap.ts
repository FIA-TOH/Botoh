import { Teams } from "../../../../changeGameState/teams";
import { sendChatMessage } from "../../../../chat/chat";
import { MESSAGES } from "../../../../chat/messages";
import { printAllPositions } from "../../../../commands/gameMode/race/printAllPositions";
import { laps } from "../../../laps";
import { isWECModeEnabled } from "../../../../changeGameState/wecMode";
import { getWECRemainingTime } from "../../../../changeGameState/wecRace";

export function notifySpectatorsCurrentLap(
  room: RoomObject,
  currentLap: number,
  pad: { p: PlayerObject; disc: DiscPropertiesObject }[],
) {
  const remaining = getWECRemainingTime(room.getScores()?.time ?? 0);
  pad
    .filter((pla) => pla.p.team !== Teams.RUNNERS)
    .forEach((pla) => {
      sendChatMessage(room, isWECModeEnabled() ? MESSAGES.WEC_TIME_REMAINING(remaining.minutes, remaining.seconds) : MESSAGES.CURRENT_LAP(currentLap, laps), pla.p.id);
      printAllPositions(room, pla.p.id, false);
    });
}
