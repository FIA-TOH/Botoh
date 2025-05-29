import { sendErrorMessage, sendAlertMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";

export let presentationLap = false;

export function handlePresentationLapCommand(
  byPlayer?: PlayerObject,
  args?: string[],
  room?: RoomObject
) {
  if (args && room) {
    if (byPlayer && !byPlayer.admin) {
      sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
      return;
    }

    const isPresentation = args[0];

    if (isPresentation !== "true" && isPresentation !== "false" && byPlayer) {
      room.sendAnnouncement("!presentation [true|false]", byPlayer.id);
      return;
    }

    sendAlertMessage(room, MESSAGES.PRESENTATION_LAP());

    presentationLap = isPresentation === "true";
  }
}
