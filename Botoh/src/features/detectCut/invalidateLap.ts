import {
  generalGameMode,
  GeneralGameMode,
} from "../changeGameState/changeGameModes";
import { PlayerInfo } from "../changePlayerState/playerList";
import { sendErrorMessage } from "../chat/chat";
import { MESSAGES } from "../chat/messages";

export function InvalidateLap(
  playerData: PlayerInfo,
  room: RoomObject,
  p: PlayerObject
) {
  if (playerData.cuttedTrackOnThisLap) {
    if (generalGameMode === GeneralGameMode.GENERAL_QUALY) {
      sendErrorMessage(room, MESSAGES.INVALID_LAP_CUT(), p.id);
    }
    playerData.lastLapValid = false;
    playerData.cuttedTrackOnThisLap = false;

    return;
  }
}
