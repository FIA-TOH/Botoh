import {
  GameMode,
  changeGameMode,
} from "../../../changeGameState/changeGameModes";
import { sendErrorMessage } from "../../../chat/chat";
import { MESSAGES } from "../../../chat/messages";
import { setMaxLapsQualy, setMaxQualyTime } from "./hardQualyFunctions";

export function handleQModeCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (!byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }

  if (room.getScores() !== null) {
    sendErrorMessage(room, MESSAGES.ALREADY_STARTED(), byPlayer.id);
    return;
  }

  const mode =
    args[0]?.toLowerCase() === "hard" ? GameMode.HARD_QUALY : GameMode.QUALY;

  if (args[1]) {
    const laps = Number(args[1]);
    if (!isNaN(laps) && laps > 0) {
      setMaxLapsQualy(laps);
      room.sendAnnouncement(
        `🏁 Qualy Mode: ${laps} max laps defined.`,
        byPlayer.id
      );
    } else {
      room.sendAnnouncement(
        "❌ Invalid max laps number",
        byPlayer.id,
        0xff0000
      );

      return;
    }
  }

  if (args[2]) {
    const time = Number(args[2]);
    if (!isNaN(time) && time > 0) {
      setMaxQualyTime(time);
      room.sendAnnouncement(`⏱️ Max qualy time: ${time} seconds.`, byPlayer.id);
    } else {
      room.sendAnnouncement("❌ Invalid time", byPlayer.id, 0xff0000);
      return;
    }
  }

  changeGameMode(mode, room);
}
