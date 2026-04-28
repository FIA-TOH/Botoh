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

  if (value !== "on" && value !== "off") {
    room.sendAnnouncement(
      "Usage: !sandbag <on|off>",
      byPlayer.id,
      0xff0000,
    );
    return;
  }

  const enabled = value === "on";
  setSandbagMode(enabled, room);

  room.sendAnnouncement(
    `Sandbag mode ${enabled ? "activated" : "deactivated"}`,
    byPlayer.id,
  );
}
