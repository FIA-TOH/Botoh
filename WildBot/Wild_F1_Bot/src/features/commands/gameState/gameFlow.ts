import { gameState } from "../../changeGameState/gameState";
import {
  startPublicFlow,
  stopPublicFlow,
} from "../../changeGameState/publicGameFlow/startStopGameFlow";
import { sendErrorMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";

export function handleChangeGameFLow(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (!byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }

  if (args[0] === "start") {
    if (gameState !== null) {
      room.sendAnnouncement(
        `The game need to be stoped to start the flow, now ${gameState}`,
        byPlayer.id
      );
      return;
    }
    startPublicFlow(room);
  } else if (args[0] === "stop") {
    stopPublicFlow(room);
  } else {
    room.sendAnnouncement("!game_flow [true|false]", byPlayer.id);
    return;
  }

  room.sendAnnouncement(`game flow - ${args[0]}`, byPlayer.id);
  return;
}
