import { printAllTimes } from "../../../changeGameState/qualy/printAllTimes";

export function handleTimesCommand(
  byPlayer: PlayerObject,
  _: string[],
  room: RoomObject
) {
  if (byPlayer.admin) {
    printAllTimes(room);
  } else {
    printAllTimes(room, byPlayer.id);
  }
}
