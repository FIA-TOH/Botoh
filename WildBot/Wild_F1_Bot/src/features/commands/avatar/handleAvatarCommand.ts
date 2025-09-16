import { playerList } from "../../changePlayerState/playerList";

export function handleAvatarCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  playerList[byPlayer.id].speedEnabled = false;
  playerList[byPlayer.id].showTires = false;

  room.setPlayerAvatar(byPlayer.id, null);
}
