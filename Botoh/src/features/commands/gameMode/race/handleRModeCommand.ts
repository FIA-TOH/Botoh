import {
  changeGameMode,
  GameMode,
} from "../../../changeGameState/changeGameModes";
import { sendErrorMessage } from "../../../chat/chat";
import { MESSAGES } from "../../../chat/messages";
import { changeLaps } from "../../adminThings/handleChangeLaps";
import { DEFAULT_LAPS } from "../../../zones/laps";

export function handleRModeCommand(
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

  changeLaps(String(DEFAULT_LAPS), undefined, room);
  changeGameMode(GameMode.RACE, room);
}
