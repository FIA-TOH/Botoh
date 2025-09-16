import { handleAvatar, Situacions } from "../changePlayerState/handleAvatar";
import { playerList } from "../changePlayerState/playerList";
import { sendChatMessage } from "../chat/chat";
import { MESSAGES } from "../chat/messages";

export function enableShowTires(player: PlayerObject, room: RoomObject) {
  const tires = !playerList[player.id].showTires;
  const speed = !tires;

  playerList[player.id].showTires = tires;
  playerList[player.id].speedEnabled = speed;

  handleAvatar(tires ? Situacions.ChangeTyre : Situacions.Speed, player, room);
  const message = tires
    ? MESSAGES.NOW_SHOWING_TIRES()
    : MESSAGES.NOW_SHOWING_SPEED();
  sendChatMessage(room, message, player.id);
}
