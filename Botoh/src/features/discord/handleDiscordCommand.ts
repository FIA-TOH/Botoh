import { sendChatMessage } from "../chat/chat";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { MESSAGES } from "../chat/messages";
import { sendDiscordMessage } from "./sendDiscordLink";

export function handleDiscordCommand(
  byPlayer: PlayerObject,
  _: string[],
  room: RoomObject
) {
  sendDiscordMessage(room);
}
