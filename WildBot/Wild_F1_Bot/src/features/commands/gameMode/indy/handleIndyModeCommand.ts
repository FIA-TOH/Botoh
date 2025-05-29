import {
  changeGameMode,
  GameMode,
} from "../../../changeGameState/changeGameModes";
import { sendErrorMessage } from "../../../chat/chat";
import { MESSAGES } from "../../../chat/messages";

export function handleIndyModeCommand(
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
  changeGameMode(GameMode.INDY, room);
  room.sendAnnouncement("Indy mode on", byPlayer.id);
}
