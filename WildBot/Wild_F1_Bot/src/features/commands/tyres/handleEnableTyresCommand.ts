import { sendErrorMessage, sendAlertMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";

export let tyresActivated = true;

export function handleEnableTyresCommand(
  byPlayer?: PlayerObject,
  args?: string[],
  room?: RoomObject
) {
  if (args && room) {
    if (byPlayer && !byPlayer.admin) {
      sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
      return;
    }

    const isActivateTyres = args[0];

    if (isActivateTyres !== "true" && isActivateTyres !== "false" && byPlayer) {
      room.sendAnnouncement(
        "Correct use: !enable_tyres [true|false]",
        byPlayer.id
      );
      return;
    }
    tyresActivated = isActivateTyres as unknown as boolean;

    if (byPlayer) {
      sendAlertMessage(
        room,
        MESSAGES.ENABLED_TYRES(tyresActivated),
        byPlayer.id
      );
      return;
    } else {
      return;
    }
  }
}
