import { sendErrorMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { changeLaps } from "../adminThings/handleChangeLaps";

export function handleLapsCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (!byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }

  if (args.length === 0) {
    sendErrorMessage(room, MESSAGES.LAPS_USAGE(), byPlayer.id);
    return;
  }

  changeLaps(args[0], byPlayer, room);
  return false;
}
