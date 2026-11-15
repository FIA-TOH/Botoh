import { sendAlertMessage } from "../chat/chat";
import { MESSAGES } from "../chat/messages";
import { updateWECRaceTime } from "./wecRace";

export function updateWECRaceClock(room: RoomObject) {
  const scores = room.getScores();
  if (scores && updateWECRaceTime(scores.time)) {
    sendAlertMessage(room, MESSAGES.WEC_24_HOURS_COMPLETED());
  }
}
