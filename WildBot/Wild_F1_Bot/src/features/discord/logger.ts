import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { sendDiscordLog } from "./discord";

export function log(...messages: any[]) {
  for (const msg of messages) {
    const type = typeof msg;
    const isLoggable =
      msg === null ||
      type === "string" ||
      type === "number" ||
      type === "boolean" ||
      type === "object" ||
      type === "undefined";

    if (!isLoggable) {
      throw new Error(
        `Unloggable item detected in log: ${String(msg)} (type: ${type})`
      );
    }
  }

  console.log(...messages);

  sendDiscordLog(messages.map((m) => String(m)).join(" "));
}
