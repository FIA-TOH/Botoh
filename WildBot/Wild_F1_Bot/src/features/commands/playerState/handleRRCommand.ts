import { gameMode, GameMode } from "../../changeGameState/changeGameModes";
import { playerList } from "../../changePlayerState/playerList";
import { resetPlayer } from "../../changePlayerState/players";
import { sendErrorMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { CIRCUITS, currentMapIndex } from "../../zones/maps";
import { rrEnabled } from "../adminThings/handleRREnabledCommand";

export function handleRRCommand(
  byPlayer: PlayerObject,
  _: string[],
  room: RoomObject
) {
  if (!rrEnabled) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }
  resetPlayer(byPlayer, room, byPlayer.id);
  if (gameMode == GameMode.QUALY || gameMode == GameMode.TRAINING) {
    playerList[byPlayer.id].kers = 100;
    playerList[byPlayer.id].wear = 20;
  }
  room.setPlayerDiscProperties(byPlayer.id, {
    xspeed: 0,
    yspeed: 0,
    xgravity: 0,
    ygravity: 0,
    x: CIRCUITS[currentMapIndex].info.lastPlace.x,
    y: CIRCUITS[currentMapIndex].info.lastPlace.y,
  });
}
