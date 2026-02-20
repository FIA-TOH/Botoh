import {
  generalGameMode,
  GeneralGameMode,
} from "../../../changeGameState/changeGameModes";
import { sendChatMessage } from "../../../chat/chat";
import { MESSAGES } from "../../../chat/messages";
import { laps } from "../../../zones/laps";
import { lapPositions } from "../../../zones/laps/handleLapChange";
import { qualiTime } from "../qualy/qualiMode";

export function handleWaitTimeCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject,
) {
  if (room.getScores() === null) {
    sendChatMessage(room, MESSAGES.NO_WAIT_TIME(), byPlayer.id);
    return false;
  }

  if (generalGameMode === GeneralGameMode.GENERAL_QUALY) {
    const willEnd = qualiTime !== Number.MAX_VALUE;

    if (!willEnd) sendChatMessage(room, MESSAGES.QUALI_WONT_END(), byPlayer.id);
    else {
      const timeLeft =
        `${Math.round(Math.max(qualiTime - room.getScores().time / 60, 0))}` +
        " minutes";
      sendChatMessage(room, MESSAGES.QUALI_WILL_END_IN(timeLeft), byPlayer.id);
    }
    return false;
  }

  let i = lapPositions.length - 1;
  while (true) {
    if (lapPositions[i].length !== 0) break;
    if (--i === -1) break;
  }

  sendChatMessage(room, MESSAGES.RACE_WILL_END_IN(laps - i - 1), byPlayer.id);
  return false;
}
