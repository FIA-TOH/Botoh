import {
  generalGameMode,
  GeneralGameMode,
} from "../../../../changeGameState/changeGameModes";
import { PlayerInfo } from "../../../../changePlayerState/playerList";
import { sendSmallChatMessage } from "../../../../chat/chat";
import { MESSAGES } from "../../../../chat/messages";

export function notifyLapStart(
  room: RoomObject,
  p: PlayerObject,
  playerData: PlayerInfo
) {
  if (playerData.currentLap === 0) {
    if (generalGameMode === GeneralGameMode.GENERAL_RACE)
      sendSmallChatMessage(room, MESSAGES.STARTING_LAP(), p.id);
    else if (generalGameMode === GeneralGameMode.GENERAL_QUALY)
      sendSmallChatMessage(room, MESSAGES.STARTING_QUALY_LAP(), p.id);
  }
}
