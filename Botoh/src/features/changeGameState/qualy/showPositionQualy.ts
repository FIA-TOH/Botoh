import { centerText } from "../../chat/centerText";
import {
  sendNonLocalizedSmallChatMessage,
  MAX_PLAYER_NAME,
  sendErrorMessage,
  sendSmallChatMessage,
} from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import {
  gameMode,
  GameMode,
  generalGameMode,
  GeneralGameMode,
} from "../changeGameModes";
import { getPlayersOrderedByQualiTime } from "./playerTime";

export function showPlayerQualiPosition(room: RoomObject, playerId: number) {
  if (generalGameMode !== GeneralGameMode.GENERAL_QUALY) return;

  const orderedList = getPlayersOrderedByQualiTime();
  const playerIndex = orderedList.findIndex((p) => p.id === playerId);

  if (playerIndex === -1) {
    sendErrorMessage(room, MESSAGES.ERROR_POSITION_QUALY(), playerId);
    return;
  }

  const position = playerIndex + 1;

  sendSmallChatMessage(room, MESSAGES.POSITION_QUALY(position), playerId);
}
