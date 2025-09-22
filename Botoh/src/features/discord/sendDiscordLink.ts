import { sendChatMessage } from "../chat/chat";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { MESSAGES } from "../chat/messages";

const DISCORD_LINKS = {
  ftoh: "https://discord.gg/qGKz5MmTxQ",
  haxbula: "https://discord.gg/UhrsXQYRsT",
};

export function sendDiscordMessage(room: RoomObject) {
  const env = (
    process.env.LEAGUE_ENV === "haxbula" ? "haxbula" : "ftoh"
  ) as keyof typeof DISCORD_LINKS;
  sendChatMessage(room, MESSAGES.DISCORD_INVITE(DISCORD_LINKS[env]));
}

export default function sendDiscordLink(
  room: RoomObject,
  timeInMinutes: number
) {
  if (!LEAGUE_MODE) {
    const env = (
      process.env.LEAGUE_ENV === "haxbula" ? "haxbula" : "ftoh"
    ) as keyof typeof DISCORD_LINKS;
    setInterval(() => {
      sendChatMessage(room, MESSAGES.DISCORD_INVITE(DISCORD_LINKS[env]));
    }, timeInMinutes * 60 * 1000);
  }
}
