import { sendErrorMessage, sendChatMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
// import { resetAllRainEvents } from "../../rain/rain";

export function handleEndRainCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (!byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }

  if (room.getScores() == null) {
    sendChatMessage(room, MESSAGES.NO_WAIT_TIME(), byPlayer.id);
    return false;
  } else {
    sendChatMessage(room, MESSAGES.RAIN_STOPPED());
    // resetAllRainEvents();
  }
}
