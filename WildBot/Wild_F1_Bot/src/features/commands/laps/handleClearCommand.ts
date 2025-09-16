import { clearBestTime } from "../../../circuits/bestTimes";
import { playerList } from "../../changePlayerState/playerList";
import { sendErrorMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { log } from "../../discord/logger";
import { ACTUAL_CIRCUIT } from "../../roomFeatures/stadiumChange";

export function handleClearCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (!byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }

  clearBestTime(ACTUAL_CIRCUIT.info.name, 999.999, "Limpado");
  const players = room.getPlayerList();
  players.forEach((p) => {
    playerList[p.id].bestTime === 999.999;
  });
  log("Best record cleared by admin");
  room.sendAnnouncement("Record cleared");
}
