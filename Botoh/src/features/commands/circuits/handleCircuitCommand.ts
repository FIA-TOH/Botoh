import {
  clearLockedWinner,
  postNewLockedWinner,
} from "../../changeGameState/vote/circuitSelection";
import { isOnVoteSession } from "../../changeGameState/vote/vote";
import { sendErrorMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { validCircuitIndex } from "../../utils";
import { handleChangeMap } from "../../zones/maps";

export function handleCircuitCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (!byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }

  if (room.getScores() !== null || isOnVoteSession) {
    sendErrorMessage(room, MESSAGES.ALREADY_STARTED(), byPlayer.id);
    return;
  }

  const index = Number(args[0]);

  if (!validCircuitIndex(index)) {
    sendErrorMessage(room, MESSAGES.INVALID_CIRCUIT_INDEX(), byPlayer.id);
  } else {
    handleChangeMap(index, room);
    clearLockedWinner();
    postNewLockedWinner(index);
  }
}
