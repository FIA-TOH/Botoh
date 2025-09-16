import { printAllPositions } from "../../../changeGameState/race/printAllPositions";

export function handlePositionsCommand(
  byPlayer: PlayerObject,
  _: string[],
  room: RoomObject
) {
  if (byPlayer.admin) {
    printAllPositions(room);
  } else {
    printAllPositions(room, byPlayer.id);
  }
}
