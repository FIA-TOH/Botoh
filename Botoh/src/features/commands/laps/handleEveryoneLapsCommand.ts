import { playerList } from "../../changePlayerState/playerList";
import { COLORS } from "../../chat/chat";

export function handleEveryoneLapsCommand(
  byPlayer: PlayerObject,
  _: string[],
  room: RoomObject
) {
  const player = playerList[byPlayer.id];
  player.everyoneLaps = !player.everyoneLaps;

  if (player.everyoneLaps) {
    room.sendAnnouncement("Showing everyone laps", byPlayer.id, COLORS.GREEN);
  } else {
    room.sendAnnouncement("Not showing everyone laps", byPlayer.id, COLORS.GREEN);
  }
}
