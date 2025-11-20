import { sendErrorMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { clearDebris } from "../../debris/clearDebris";

export function handleClearDebrisCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  try {
    if (!byPlayer?.admin) {
      sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer?.id);
      return;
    }

    if (room.getScores() === null) {
      sendErrorMessage(room, MESSAGES.NOT_STARTED(), byPlayer.id);
      return;
    }

    clearDebris(room);
    room.sendAnnouncement("All debris cleared on the track", byPlayer.id);
  } catch (err) {
    console.error("[handleClearDebrisCommand] Unknown error:", err);
  }
}
