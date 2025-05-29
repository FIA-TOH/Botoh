import { getBestTime } from "../../../circuits/bestTimes";
import { ACTUAL_CIRCUIT } from "../../roomFeatures/stadiumChange";

export function handleRecordCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (ACTUAL_CIRCUIT && ACTUAL_CIRCUIT.info.BestTime) {
    getBestTime(ACTUAL_CIRCUIT.info.name, room, byPlayer);
  }
}
