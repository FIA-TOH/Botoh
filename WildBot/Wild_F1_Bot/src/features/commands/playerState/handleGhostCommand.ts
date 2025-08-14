import { setGhostMode } from "../../changePlayerState/ghost";
import { sendErrorMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";

export function handleGhostCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (!byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }
  let boolean = false;

  if (args[0] === "false") {
    boolean = false;
  } else if (args[0] === "true") {
    boolean = true;
  } else {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }

  setGhostMode(room, boolean, byPlayer.id);
}
