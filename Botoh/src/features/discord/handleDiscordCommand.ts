import { sendChatMessage } from "../chat/chat";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { MESSAGES } from "../chat/messages";

export function handleDiscordCommand(
  byPlayer: PlayerObject,
  _: string[],
  room: RoomObject
) {
  sendChatMessage(room, MESSAGES.DISCORD_INVITE());
}
