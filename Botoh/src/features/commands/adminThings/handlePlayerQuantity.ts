import { sendErrorMessage, sendSuccessMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";

export function handlePlayerQuantity(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  try {
    if (!byPlayer.admin) {
      sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
      return;
    }

    const players = room.getPlayerList?.() || [];
    if (!Array.isArray(players)) {
      console.error("[handlePlayerQuantity] Invalid list:", players);

      return;
    }

    const redCount = players.filter((p) => p?.team === 1).length || 0;
    const blueCount = players.filter((p) => p?.team === 2).length || 0;
    const specCount = players.filter((p) => p?.team === 0).length || 0;

    room.sendAnnouncement?.(
      `There are ${players.length} players in total.`,
      byPlayer.id
    );
    room.sendAnnouncement?.(
      `🟥 Red: ${redCount} | 🟦 Blue: ${blueCount} | 👀 Spec: ${specCount}`,
      byPlayer.id
    );
  } catch (err) {
    console.error(
      "[handlePlayerQuantity] Unknow error in handlePlayerQuantity:",
      err
    );
  }
}
