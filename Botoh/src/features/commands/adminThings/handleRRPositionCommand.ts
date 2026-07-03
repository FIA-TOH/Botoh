import { COLORS, sendErrorMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { LEAGUE_MODE } from "../../hostLeague/leagueMode";
import { savePublicCircuitRRPosition } from "../../public/publicCircuitRR";
import { ACTUAL_CIRCUIT } from "../../roomFeatures/stadiumChange";
import { setRRPosition } from "./rrPositionState";

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

    const x = byPlayer.position.x;
    const y = byPlayer.position.y;

    setRRPosition(x, y);
    if (!LEAGUE_MODE && ACTUAL_CIRCUIT?.info?.name) {
      savePublicCircuitRRPosition(ACTUAL_CIRCUIT.info.name, x, y);
    }

    room.sendAnnouncement("New RR position setted", byPlayer.id, COLORS.GREEN);
  } catch (err) {
    console.error("[handleRRPositionCommand] Unknown error:", err);
  }
}
