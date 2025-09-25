import { sendErrorMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { changeConstant, constants } from "../../speed/constants";

export function handleChangePropierties(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (!byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }
  if (!args) {
    room.sendAnnouncement(
      "Correct use: !constants [CONSTANT] [value]",
      byPlayer.id,
      0xff0000
    );
  }
  const key = args[0].toUpperCase() as keyof typeof constants;
  const value = Number(args[1]);

  if (!value || !key) {
    room.sendAnnouncement("Error", byPlayer.id, 0xff0000);
    return;
  }

  if (!(key in constants)) {
    room.sendAnnouncement(`Constant "${args[0]}" not found.`, byPlayer.id);
    return;
  }

  if (isNaN(value)) {
    room.sendAnnouncement(`Second argument needs to be a number`, byPlayer.id);
    return;
  }

  changeConstant(key, value);
  room.sendAnnouncement(`${key} changed to: ${value}`, byPlayer.id);
}
