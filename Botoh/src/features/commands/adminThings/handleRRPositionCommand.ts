import { sendErrorMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";

export interface RR_POSITION_INTERFACE {
  x: number;
  y: number;
}

export let RR_POSITION: RR_POSITION_INTERFACE | undefined = undefined;

export function handleRRPositionCommand(
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

    setRRPosition(byPlayer.position.x, byPlayer.position.y);
    room.sendAnnouncement("New RR position setted", byPlayer.id);
  } catch (err) {
    console.error("[handleRRPositionCommand] Unknown error:", err);
  }
}

export function clearRRPosition() {
  RR_POSITION = undefined;
}

export function setRRPosition(x: number, y: number) {
  RR_POSITION = { x, y };
}
