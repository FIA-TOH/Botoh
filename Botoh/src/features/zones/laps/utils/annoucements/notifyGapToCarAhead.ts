import { playerList } from "../../../../changePlayerState/playerList";
import { sendChatMessage } from "../../../../chat/chat";
import { MESSAGES } from "../../../../chat/messages";
import { serialize } from "../../../../utils";
import { lapPositions } from "../../handleLapChange";

export function notifyGapToCarAhead(
  p: PlayerObject,
  room: RoomObject,
  lapIndex: number,
  position: number,
  currentLap: number
) {
  const prevPlayer = lapPositions[lapIndex][position - 2];
  const distance =
    prevPlayer.currentLap > currentLap
      ? prevPlayer.currentLap - currentLap
      : serialize(playerList[prevPlayer.id].lapTime);

  sendChatMessage(
    room,
    MESSAGES.POSITION_AND_DISTANCE_AHEAD(
      position,
      distance,
      typeof distance === "number" ? "laps" : "seconds"
    ),
    p.id
  );
}
