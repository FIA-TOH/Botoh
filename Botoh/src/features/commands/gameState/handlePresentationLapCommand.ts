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

    if (isPresentation !== "on" && isPresentation !== "off" && byPlayer) {
      room.sendAnnouncement("!presentation [on|off]", byPlayer.id);
      return;
    }

    sendAlertMessage(room, MESSAGES.PRESENTATION_LAP());

    presentationLap = isPresentation === "on";
  }
}
