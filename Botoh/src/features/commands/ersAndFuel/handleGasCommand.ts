import { sendErrorMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { log } from "../../discord/logger";
import { enableGas } from "../../speed/handleSlipstream";

export function handleGasCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (!byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }

  if (!args[0]) {
    room.sendAnnouncement("Usage: !gas <on|off>", byPlayer.id, 0xff0000);
    return;
  }

  const value = args[0].toLowerCase();
  
  if (value === "on") {
    log("Gas mode enabled by admin");
    room.sendAnnouncement("Gas mode!");
    enableGas(true);
  } else if (value === "off") {
    log("Gas mode disabled by admin");
    room.sendAnnouncement("No Gas mode!");
    enableGas(false);
  } else {
    room.sendAnnouncement("Invalid value. Use: !gas <on|off>", byPlayer.id, 0xff0000);
  }
}
