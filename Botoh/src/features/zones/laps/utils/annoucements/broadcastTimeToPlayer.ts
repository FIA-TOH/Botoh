import { playerList } from "../../../../changePlayerState/playerList";
import { sendSuccessMessage } from "../../../../chat/chat";
import { MESSAGES } from "../../../../chat/messages";
import { getPlayerAndDiscs } from "../../../../playerFeatures/getPlayerAndDiscs";
import { getPlayerByName } from "../../../../playerFeatures/getPlayerBy";

export async function broadcastLapTimeToPlayers(
  room: RoomObject,
  lapTime: number,
  playerName: string,
  showToPlayer?: boolean
) {
  const playersAndDiscs = getPlayerAndDiscs(room);

  const playersWithEveryoneLaps = playersAndDiscs.filter((pla) => {
    const player = playerList[pla.p?.id];
    return player && player.everyoneLaps;
  });

  playersWithEveryoneLaps.forEach((pla) => {
    sendSuccessMessage(
      room,
      MESSAGES.LAP_TIME_FROM(lapTime, playerName),
      pla.p.id
    );
  });
  const p = await getPlayerByName(playerName);
  if (p && showToPlayer)
    sendSuccessMessage(room, MESSAGES.LAP_TIME(lapTime), p.p.id);
}
