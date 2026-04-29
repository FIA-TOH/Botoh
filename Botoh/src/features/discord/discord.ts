import { playerList } from "../changePlayerState/playerList";
import { getPlayerScuderia } from "../commands/scuderia/getScuderia";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { ACTUAL_CIRCUIT } from "../roomFeatures/stadiumChange";
import { getTimestamp } from "../utils";

const getDiscordWebhooks = () => ({
  PUBLIC_CHAT_URL: process.env.DISCORD_PUBLIC_CHAT_URL || "",
  PUBLIC_LOG_URL: process.env.DISCORD_PUBLIC_LOG_URL || "",
  PUBLIC_REPLAY_URL: process.env.DISCORD_PUBLIC_REPLAY_URL || "",
  LEAGUE_CHAT_URL: process.env.DISCORD_LEAGUE_CHAT_URL || "",
  LEAGUE_LOG_URL: process.env.DISCORD_LEAGUE_LOG_URL || "",
  LEAGUE_REPLAY_URL: process.env.DISCORD_LEAGUE_REPLAY_URL || "",
  TRACK_RECORDS_URL: process.env.DISCORD_TRACK_RECORDS_URL || "",
  CUT_TRACK_URL: process.env.DISCORD_CUT_TRACK_URL || "",
  LEAGUE_REPLAY_URL_HAXBULA: process.env.DISCORD_LEAGUE_REPLAY_URL_HAXBULA || "",
  GENERAL_CHAT_HAXBULA_URL: process.env.DISCORD_GENERAL_CHAT_HAXBULA_URL || "",
  GENERAL_CHAT_FTOH_URL: process.env.DISCORD_GENERAL_CHAT_FTOH_URL || "",
  LEAGUE_REPLAY_URL_FH: process.env.DISCORD_LEAGUE_REPLAY_URL_FH || ""
});

function splitMessage(msg: string, size = 2000): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < msg.length; i += size) {
    chunks.push(msg.slice(i, i + size));
  }
  return chunks;
}
function splitCodeMessage(msg: string, size = 1900): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < msg.length; i += size) {
    const part = msg.slice(i, i + size);
    chunks.push("```" + part + "```");
  }
  return chunks;
}

async function safeSend(
  url: string,
  body: any,
  source: string,
  isFormData = false
) {
  try {
    if (!body)
      return console.warn(`⚠️ [Discord SKIPPED] (${source}): body empty`);

    const options: RequestInit = {
      method: "POST",
      body: isFormData ? body : JSON.stringify(body),
    };

    if (!isFormData) {
      options.headers = { "Content-Type": "application/json" };
    }

    const res = await fetch(url, options);

    if (!res.ok) {
      if (res.status === 429) {
        const delay = 1000;
        setTimeout(() => safeSend(url, body, source, isFormData), delay);
      } else {
        console.error(
          `❌ [Discord ERROR ${res.status}] (${source}):`,
          await res.text()
        );
      }
    }
  } catch (err) {
    console.error(`❌ [Discord NETWORK ERROR] (${source}):`, err);
  }
}

export function sendDiscordFile(data: any, fileName: string, source: string) {
  try {
    const webhooks = getDiscordWebhooks();
    const FILE_URL = LEAGUE_MODE ? webhooks.LEAGUE_LOG_URL : webhooks.PUBLIC_LOG_URL;
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const formData = new FormData();
    formData.append("file", blob, fileName);
    safeSend(FILE_URL, formData, source, true);
  } catch (err) {
    console.error("❌ [sendDiscordFile ERROR]:", err);
  }
}

export function sendDiscordLog(message: string) {
  try {
    if (!message) return;
    const webhooks = getDiscordWebhooks();
    const LOG_URL = LEAGUE_MODE ? webhooks.LEAGUE_LOG_URL : webhooks.PUBLIC_LOG_URL;
    const sanitized = message.replace(/@(?=[a-zA-Z])/g, "@ ");
    const timestamped = `${sanitized} - ${getTimestamp()}`;
    splitMessage(timestamped).forEach((part) =>
      safeSend(LOG_URL, { content: part }, "LOG")
    );
  } catch (err) {
    console.error("❌ [sendDiscordLog ERROR]:", err);
  }
}

export function sendDiscordChat(message: string) {
  try {
    const webhooks = getDiscordWebhooks();
    const MESSAGES_URL = LEAGUE_MODE ? webhooks.LEAGUE_CHAT_URL : webhooks.PUBLIC_CHAT_URL;
    const sanitized = message.replace(/@(?=[a-zA-Z])/g, "@ ");
    splitMessage(sanitized).forEach((part) =>
      safeSend(MESSAGES_URL, { content: part }, "CHAT")
    );
  } catch (err) {
    console.error("❌ [sendDiscordChat ERROR]:", err);
  }
}

export function sendDiscordPlayerChat(userInfo: PlayerObject, message: string) {
  try {
    const webhooks = getDiscordWebhooks();
    const MESSAGES_URL = LEAGUE_MODE ? webhooks.LEAGUE_CHAT_URL : webhooks.PUBLIC_CHAT_URL;
    const sanitized = message.replace(/@(?=[a-zA-Z])/g, "@ ");
    const team = getPlayerScuderia(playerList[userInfo.id]);
    const embedColor = team?.color ?? 0xb3b3b3;

    splitMessage(sanitized).forEach((part) => {
      const embed = {
        username: userInfo.name,
        embeds: [
          {
            color: embedColor,
            description: part,
            footer: { text: getTimestamp() },
          },
        ],
      };
      safeSend(MESSAGES_URL, embed, "PLAYER_CHAT_EMBED");
    });
  } catch (err) {
    console.error("❌ [sendDiscordPlayerChat ERROR]:", err);
  }
}

export function sendDiscordResult(message: string) {
  try {
    if (!message) return;
    const envName = process.env.LEAGUE_ENV || "ftoh";
    const webhooks = getDiscordWebhooks();
    let LOG_URL = "";
    if (envName === "haxbula") {
      LOG_URL = LEAGUE_MODE ? webhooks.LEAGUE_REPLAY_URL_HAXBULA : webhooks.PUBLIC_REPLAY_URL;
    } else {
      LOG_URL = LEAGUE_MODE ? webhooks.LEAGUE_REPLAY_URL : webhooks.PUBLIC_REPLAY_URL;
    }
    if (envName === "fh") {
      LOG_URL = LEAGUE_MODE ? webhooks.LEAGUE_REPLAY_URL_FH : webhooks.PUBLIC_REPLAY_URL;
    }

    const sanitized = message.replace(/@(?=[a-zA-Z])/g, "@ ");
    const timestamped = `${sanitized}\n\n📅 ${getTimestamp()}`;

    splitCodeMessage(timestamped).forEach((part) =>
      safeSend(LOG_URL, { content: part }, "RESULT")
    );
  } catch (err) {
    console.error("❌ [sendDiscordResult ERROR]:", err);
  }
}

export function sendDiscordTrackRecord(playerName: string, lapTime: number) {
  try {
    // Validar lapTime
    if (!isFinite(lapTime) || lapTime <= 0) {
      console.warn(`⚠️ Track record inválido para ${playerName}: ${lapTime}`);
      return;
    }
    const webhooks = getDiscordWebhooks();
    const embed = {
      username: "Records de Pista",
      embeds: [
        {
          color: 0xff75d1,
          title: "New track record! 🏆",
          fields: [
            { name: "🏎️ Driver:", value: playerName, inline: false },
            {
              name: "🌍 Circuit:",
              value: ACTUAL_CIRCUIT.info.name,
              inline: false,
            },
            {
              name: "⏱️ Time:",
              value: lapTime.toFixed(3) + "s",
              inline: false,
            },
          ],
          footer: { text: getTimestamp() },
        },
      ],
    };
    safeSend(webhooks.TRACK_RECORDS_URL, embed, "TRACK_RECORD_EMBED");
  } catch (err) {
    console.error("❌ [sendDiscordTrackRecord ERROR]:", err);
  }
}

function generateFileName() {
  try {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `HBReplay-${pad(now.getDate())}-${pad(
      now.getMonth() + 1
    )}-${now.getFullYear()}-${pad(now.getHours())}h${pad(now.getMinutes())}m-[${
      ACTUAL_CIRCUIT.info.name
    }].hbr2`;
  } catch (err) {
    console.error("❌ [generateFileName ERROR]:", err);
    return `HBReplay-unknown.hbr2`;
  }
}

export function sendDiscordReplay(replay: Uint8Array) {
  try {
    const webhooks = getDiscordWebhooks();
    const REPLAYS_URL = LEAGUE_MODE ? webhooks.LEAGUE_REPLAY_URL : webhooks.PUBLIC_REPLAY_URL;

    const buffer = Buffer.from(replay);
    const blob = new Blob([new Uint8Array(buffer)], {
      type: "application/octet-stream",
    });

    const formData = new FormData();
    formData.append("file", blob, generateFileName());

    safeSend(REPLAYS_URL, formData, "REPLAY", true);
  } catch (err) {
    console.error("❌ [sendDiscordReplay ERROR]:", err);
  }
}

export function sendDiscordGeneralChatQualy(message: string) {
  try {
    const envName = process.env.LEAGUE_ENV || "ftoh";
    const webhooks = getDiscordWebhooks();

    const MESSAGES_URL =
      envName === "haxbula" ? webhooks.GENERAL_CHAT_HAXBULA_URL : webhooks.GENERAL_CHAT_FTOH_URL;
    const codeMessage = "```" + message + "```";
    safeSend(MESSAGES_URL, { content: codeMessage }, "GENERAL_CHAT_QUALY");
  } catch (err) {
    console.error("❌ [sendDiscordGeneralChatQualy ERROR]:", err);
  }
}

export function sendDiscordCutTrack(message: string) {
  try {
    const webhooks = getDiscordWebhooks();
    safeSend(webhooks.CUT_TRACK_URL, { content: message }, "CUT_TRACK_DETECTOR");
  } catch (err) {
    console.error("❌ [sendDiscordCutTrack ERROR]:", err);
  }
}

export function splitCutMessageIntoSafeBlocks(
  msg: string,
  size = 1900
): string[] {
  const parts: string[] = [];

  for (let i = 0; i < msg.length; i += size) {
    const chunk = msg.slice(i, i + size);
    parts.push("```" + chunk + "```");
  }

  return parts;
}
