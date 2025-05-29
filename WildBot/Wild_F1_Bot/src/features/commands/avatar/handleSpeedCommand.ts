import { playerList } from "../../changePlayerState/playerList";
import { sendChatMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";

export function handleSpeedCommand(
  byPlayer: PlayerObject,
  _: string[],
  room: RoomObject
) {
  const tires = !playerList[byPlayer.id].showTires;
  const speed = !tires; // O oposto de mostrar pneus

  playerList[byPlayer.id].showTires = tires;
  playerList[byPlayer.id].speedEnabled = speed;

  const message = tires
    ? MESSAGES.NOW_SHOWING_TIRES()
    : MESSAGES.NOW_SHOWING_SPEED();
  sendChatMessage(room, message, byPlayer.id);
}
