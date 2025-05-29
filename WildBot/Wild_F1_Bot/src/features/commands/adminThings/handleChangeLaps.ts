import { gameMode, GameMode } from "../../changeGameState/changeGameModes";
import { sendErrorMessage, sendChatMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { setLaps } from "../../zones/laps";

export function changeLaps(
  newLapsArg?: string,
  byPlayer?: PlayerObject,
  room?: RoomObject
) {
  if (room && newLapsArg) {
    const newLaps = Number(newLapsArg);
    if (byPlayer) {
      if (gameMode == GameMode.QUALY || gameMode == GameMode.TRAINING) {
        sendErrorMessage(room, MESSAGES.LAPS_IN_QUALI(), byPlayer.id);
        return false;
      }

      if (room.getScores() !== null) {
        sendErrorMessage(room, MESSAGES.ALREADY_STARTED(), byPlayer.id);
        return false;
      }
      if (!isNaN(newLaps)) {
        setLaps(newLaps);
        sendChatMessage(room, MESSAGES.LAPS_CHANGED_TO(newLaps), byPlayer.id);
        return true;
      } else {
        sendErrorMessage(room, MESSAGES.LAPS_USAGE(), byPlayer.id);
        return false;
      }
    } else {
      setLaps(newLaps);
      return true;
    }
  }
  return false;
}
