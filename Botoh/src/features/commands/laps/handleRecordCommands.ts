import { getBestTime } from "../../../circuits/bestTimes";
import { sendBlueMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { ACTUAL_CIRCUIT } from "../../roomFeatures/stadiumChange";

export function handleRecordCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (ACTUAL_CIRCUIT && ACTUAL_CIRCUIT.info.BestTime) {
    const record = getBestTime(ACTUAL_CIRCUIT.info.name);

    if (record) {
      const [bestTime, driver, track] = record;
      sendBlueMessage(room, MESSAGES.BEST_TIME(driver, bestTime.toString()), byPlayer.id);
    }
  }
}
