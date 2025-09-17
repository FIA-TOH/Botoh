import { sendErrorMessage, sendChatMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
// import { setRainItensity } from "../../rain/rain";

export function handleRainItensity(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (!byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }

  let intensity = Math.round(parseFloat(args[0]));
  if (room.getScores() == null) {
    sendChatMessage(room, MESSAGES.NO_WAIT_TIME(), byPlayer.id);
    return false;
  } else if (Number.isNaN(intensity)) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
  } else {
    sendChatMessage(room, MESSAGES.NEW_RAIN_INTENSITY(intensity));
    // setRainItensity(intensity);
  }
}
