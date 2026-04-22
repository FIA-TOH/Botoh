import { sendErrorMessage } from "../../../chat/chat";
import { MESSAGES } from "../../../chat/messages";
import { setSandbagMode } from "./handleSandbag";

export function handleSandbagCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject,
) {
  if (!byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }

  if (room.getScores() !== null) {
    sendErrorMessage(room, MESSAGES.ALREADY_STARTED(), byPlayer.id);
    return;
  }

  const value = args[0];

  if (value !== "true" && value !== "false") {
    room.sendAnnouncement(
      "Usage: !sandbag <true|false>",
      byPlayer.id,
      0xff0000,
    );
    return;
  }

  const enabled = value === "true";
  setSandbagMode(enabled, room);

  room.sendAnnouncement(
    `Sandbag mode ${enabled ? "activated" : "deactivated"}`,
    byPlayer.id,
  );
}
