import { kickPlayer } from "../../utils";

export function handleBBCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  kickPlayer(byPlayer.id, `!bb`, room);
}
