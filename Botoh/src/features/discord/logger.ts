import { sendDiscordLog } from "./discord";

interface LogOptions {
  sendToDiscord?: boolean;
}

export function log(...args: any[]) {
  let options: LogOptions = { sendToDiscord: true };
  let messages = args;

  const last = args[args.length - 1];
  if (last && typeof last === "object" && "sendToDiscord" in last) {
    options = { ...(last as LogOptions) };
    messages = args.slice(0, -1);
  }

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

  // if (options.sendToDiscord) {
  //   sendDiscordLog(messages.map((m) => String(m)).join(" "));
  // }
}
