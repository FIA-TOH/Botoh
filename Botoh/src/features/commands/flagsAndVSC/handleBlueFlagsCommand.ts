import { sendErrorMessage, sendSuccessMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { setBlueFlagsEnabled } from "./blueFlags";

export function handleBlueFlagsCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject,
) {
  if (!byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }

  const value = args[0]?.toLowerCase();
  if (value !== "on" && value !== "off") {
    sendErrorMessage(room, MESSAGES.BLUE_FLAGS_USAGE(), byPlayer.id);
    return;
  }

  const enabled = value === "on";
  setBlueFlagsEnabled(enabled);
  sendSuccessMessage(room, MESSAGES.BLUE_FLAGS_SUCCESS(enabled), byPlayer.id);
}
