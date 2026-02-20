import {
  generalGameMode,
  GeneralGameMode,
} from "../../../changeGameState/changeGameModes";
import { sendErrorMessage, sendSmallChatMessage } from "../../../chat/chat";
import { MESSAGES } from "../../../chat/messages";
import { getPlayersOrderedByQualiTime } from "./playerTime";

export function getNumberPositionQualy(room: RoomObject, playerId: number) {
  const orderedList = getPlayersOrderedByQualiTime();
  const playerIndex = orderedList.findIndex((p) => p.id === playerId);
  if (playerIndex === -1) {
    sendErrorMessage(room, MESSAGES.ERROR_POSITION_QUALY(), playerId);
    return;
  }

  const position = playerIndex + 1;

  return position;
}

export function showPlayerQualiPosition(room: RoomObject, playerId: number) {
  if (generalGameMode !== GeneralGameMode.GENERAL_QUALY) return;

  const position = getNumberPositionQualy(room, playerId);
  if (!position) {
    sendErrorMessage(room, MESSAGES.ERROR_POSITION_QUALY(), playerId);
    return;
  }

  sendSmallChatMessage(room, MESSAGES.POSITION_QUALY(position), playerId);
}
