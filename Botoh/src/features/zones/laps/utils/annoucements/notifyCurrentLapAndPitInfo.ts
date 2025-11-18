import { playerList } from "../../../../changePlayerState/playerList";
import { sendChatMessage } from "../../../../chat/chat";
import { MESSAGES } from "../../../../chat/messages";
import { processIfMinimumPitStopsMet } from "../../../../tires&pits/minimumPit";
import { laps } from "../../../laps";

export function notifyCurrentLapAndPitInfo(
  p: PlayerObject,
  room: RoomObject,
  currentLap: number
) {
  sendChatMessage(room, MESSAGES.CURRENT_LAP(currentLap, laps), p.id);

  const data = playerList[p.id];

  processIfMinimumPitStopsMet(p, currentLap, laps, data.pits.pitsNumber, room);
}
