import { sendDiscordMessage } from "./discord";

export function log(...messages: any[]) {
  for (const msg of messages) {
    const type = typeof msg;
    const isLoggable =
      msg === null ||
      type === "string" ||
      type === "number" ||
      type === "boolean" ||
      type === "object" || // permite arrays e objetos
      type === "undefined";

    if (!isLoggable) {
      throw new Error(
        `Unloggable item detected in log: ${String(msg)} (type: ${type})`
      );
    }
  }

  console.log(...messages);
  // sendDiscordMessage(messages.map(m => String(m)).join(' '));
}
