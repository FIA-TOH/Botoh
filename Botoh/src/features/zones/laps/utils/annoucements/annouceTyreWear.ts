import {
  generalGameMode,
  GeneralGameMode,
} from "../../../../changeGameState/changeGameModes";
import { PlayerInfo } from "../../../../changePlayerState/playerList";
import { sendChatMessage } from "../../../../chat/chat";
import { MESSAGES } from "../../../../chat/messages";
import { tyresActivated, Tires } from "../../../../tires&pits/tires";

export function annouceTyreWear(
  room: RoomObject,
  p: PlayerObject,
  playerData: PlayerInfo
) {
  if (
    !tyresActivated ||
    generalGameMode === GeneralGameMode.GENERAL_QUALY ||
    playerData.tires === Tires.FLAT
  ) {
    return;
  }

  sendChatMessage(
    room,
    MESSAGES.TYRE_WEAR_LAP(100 - Math.round(playerData.wear)),
    p.id
  );
}
