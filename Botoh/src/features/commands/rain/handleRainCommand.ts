import { sendErrorMessage, sendChatMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
// import { setRainChances } from "../../rain/rain";

export function handleRainCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (!byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }

  let newRain = parseInt(args[0]);
  if (room.getScores() == null) {
    sendChatMessage(room, MESSAGES.NO_WAIT_TIME(), byPlayer.id);
    return false;
  } else if (Number.isNaN(newRain)) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
  } else {
    if (!byPlayer.admin || args.length !== 1 || isNaN(newRain)) {
      sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
      return;
    }

    // setRainChances(newRain);
    sendChatMessage(room, MESSAGES.RAIN_CHANCES(newRain));
  }
}
