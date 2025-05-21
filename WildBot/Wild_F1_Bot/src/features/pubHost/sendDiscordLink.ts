import { sendChatMessage } from "../chat";
import { LEAGUE_MODE } from "../leagueMode";
import { MESSAGES } from "../messages";

export default function sendDiscordLink(
  room: RoomObject,
  timeInMinutes: number
) {
  if (!LEAGUE_MODE) {
    setInterval(() => {
      sendChatMessage(room, MESSAGES.DISCORD_INVITE());
    }, timeInMinutes * 60 * 1000);
  }
}
