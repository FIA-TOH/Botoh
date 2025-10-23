import { sendErrorMessage, sendSuccessMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";

export let PLAYER_LIMIT = 22;

export function handleLimitPlayerQuantity(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  try {
    if (!byPlayer?.admin) {
      sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer?.id);
      return;
    }

    const limitArg = Number(args?.[0]);
    if (isNaN(limitArg) || limitArg < 0) {
      room.sendAnnouncement(
        "⚠️ the limit should be a number",
        byPlayer.id,
        0xff1500
      );
      return;
    }

    PLAYER_LIMIT = limitArg === 0 ? 22 : limitArg;

    room.sendAnnouncement(
      `Now the quantity limit of players is ${PLAYER_LIMIT}`,
      byPlayer.id
    );
  } catch (err) {
    console.error("[handleLimitPlayerQuantity] Erro inesperado:", err);
  }
}
