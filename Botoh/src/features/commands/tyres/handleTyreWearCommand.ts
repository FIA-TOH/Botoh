import { sendErrorMessage, sendSuccessMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { setTyreWearEnabled } from "../../tires&pits/handleTireWear";

export function handleTyreWearCommand(
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
    sendErrorMessage(room, MESSAGES.TYRE_WEAR_USAGE(), byPlayer.id);
    return;
  }

  const enabled = value === "on";
  setTyreWearEnabled(enabled);
  sendSuccessMessage(room, MESSAGES.TYRE_WEAR_SUCCESS(enabled), byPlayer.id);
}
