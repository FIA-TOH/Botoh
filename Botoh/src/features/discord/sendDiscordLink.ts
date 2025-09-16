import { sendChatMessage } from "../chat/chat";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { MESSAGES } from "../chat/messages";

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
