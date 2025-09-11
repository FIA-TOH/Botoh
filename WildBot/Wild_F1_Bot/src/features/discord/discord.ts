import { playerList } from "../changePlayerState/playerList";
import { getPlayerTeam } from "../commands/teams/getTeam";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { ACTUAL_CIRCUIT } from "../roomFeatures/stadiumChange";
import { getTimestamp } from "../utils";

const PUBLIC_CHAT_URL =
  "https://discord.com/api/webhooks/1409976523330682950/9SS0ZO32tm8KzreIq0PcQi3C3_isAF27CjGlHeYFDDxev3bTHJ5xUlkRDIx-N6gNhTvV";
const LEAGUE_CHAT_URL =
  "https://discord.com/api/webhooks/1409977213574582483/NM2mnWN-q2jfYdzjIBtEKROpEeuQTx3VR9fFH8Xxfpdb6NTe5lKXb1iFlepxNJMggDdG";

const PUBLIC_LOG_URL =
  "https://discord.com/api/webhooks/1409973122123305110/epnjcCGSYoH67p2F40GEOWkADE04ICFE3hWh2QinZ-EwdRouh5fs1oDMv19WS51ljLEP";

const LEAGUE_LOG_URL =
  "https://discord.com/api/webhooks/1409974260604211230/KAkU33uUQnMRARZUcv9f0y4O6Ayuomjjsy6QHc6TO1mAmBd4Pvo6eAwJkdmJF5ACcYHU";

const LEAGUE_REPLAY_URL =
  "https://discord.com/api/webhooks/1409983513884885163/SHzJwoxubzzUzCZ8nAJ8R5cTE_sX1eM4gkRpROiIdBFfXdRjVKM5kK4mYwbcJBMqARPT";

const PUBLIC_REPLAY_URL =
  "https://discord.com/api/webhooks/1409983406971945080/z_HnlNnCnRQlD7nTfAPyjkMUYpGYYKM8j9jQutjGbXmo2jmIJmPdSrwXBtp27FxaCtBe";

const TRACK_RECORDS_URL =
  "https://discord.com/api/webhooks/1415118391546613810/O49b609XYQkYj1Y6G5KOkkkuifHiNevGRcb3SqK0hNVgJmzf9976ByNc7UdznUYQceZg";

function splitMessage(msg: string, size = 2000): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < msg.length; i += size) {
    chunks.push(msg.slice(i, i + size));
  }
  return chunks;
}

export function sendDiscordFile(data: any, fileName: string, source: string) {
  const FILE_URL = LEAGUE_MODE ? LEAGUE_LOG_URL : PUBLIC_LOG_URL;
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const formData = new FormData();
  formData.append("file", blob, fileName);

  sendRequestWithRetry(FILE_URL, formData, source, 1000, true);
}

export function sendDiscordLog(message: string) {
  const LOG_URL = LEAGUE_MODE ? LEAGUE_LOG_URL : PUBLIC_LOG_URL;
  const sanitizedMessage = message.replace(/@(?=[a-zA-Z])/g, "@ ");
  const timestampedMessage = `${sanitizedMessage} - ${getTimestamp()}`;
  const parts = splitMessage(timestampedMessage);

  parts.forEach((part) => {
    sendRequestWithRetry(LOG_URL, { content: part }, "LOG");
  });
}
export function sendDiscordChat(message: string) {
  const MESSAGES_URL = LEAGUE_MODE ? LEAGUE_CHAT_URL : PUBLIC_CHAT_URL;
  const request = new XMLHttpRequest();
  const sanitizedMessage = message.replace(/@(?=[a-zA-Z])/g, "@ ");
  request.open("POST", MESSAGES_URL);
  request.setRequestHeader("Content-type", "application/json");
  const parts = splitMessage(sanitizedMessage);
  parts.forEach((part) => {
    sendRequestWithRetry(MESSAGES_URL, { content: part }, "CHAT");
  });
}
export function sendDiscordPlayerChat(userInfo: PlayerObject, message: string) {
  const MESSAGES_URL = LEAGUE_MODE ? LEAGUE_CHAT_URL : PUBLIC_CHAT_URL;
  const sanitizedMessage = message.replace(/@(?=[a-zA-Z])/g, "@ ");

  const team = getPlayerTeam(playerList[userInfo.id]);

  const embedColor = team ? team.color : 0xb3b3b3;

  const parts = splitMessage(sanitizedMessage);

  parts.forEach((part) => {
    const embed = {
      username: userInfo.name,
      embeds: [
        {
          color: embedColor,
          description: part,
          footer: {
            text: getTimestamp(),
          },
        },
      ],
    };

    sendRequestWithRetry(MESSAGES_URL, embed, "PLAYER_CHAT_EMBED");
  });
}

export function sendDiscordResult(message: string) {
  const LOG_URL = LEAGUE_MODE ? LEAGUE_REPLAY_URL : PUBLIC_REPLAY_URL;
  const sanitizedMessage = message.replace(/@(?=[a-zA-Z])/g, "@ ");
  const timestampedMessage = `${sanitizedMessage} - ${getTimestamp()}`;
  const parts = splitMessage(timestampedMessage);

  parts.forEach((part) => {
    sendRequestWithRetry(LOG_URL, { content: part }, "RESULT");
  });
}
export function sendDiscordTrackRecord(playerName: string, lapTime: number) {
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
            value: ACTUAL_CIRCUIT.info.name + " - By Ximb",
            inline: false,
          },
          { name: "⏱️ Time:", value: lapTime.toFixed(3) + "s", inline: false },
        ],
        footer: {
          text: getTimestamp(),
        },
      },
    ],
  };

  sendRequestWithRetry(TRACK_RECORDS_URL, embed, "TRACK_RECORD_EMBED");
}

function generateFileName() {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `HBReplay-${day}-${month}-${year}-${hours}h${minutes}m - [${ACTUAL_CIRCUIT.info.name}].hbr2`;
}

export function sendDiscordReplay(replay: Uint8Array) {
  const REPLAYS_URL = LEAGUE_MODE ? LEAGUE_REPLAY_URL : PUBLIC_REPLAY_URL;

  const arrayBuffer: ArrayBuffer = replay.buffer.slice(
    replay.byteOffset,
    replay.byteOffset + replay.byteLength
  ) as ArrayBuffer;

  const blob = new Blob([arrayBuffer], { type: "application/octet-stream" });

  const formData = new FormData();
  formData.append("file", blob, generateFileName());

  sendRequestWithRetry(REPLAYS_URL, formData, "REPLAY", 1000, true);
}
function sendRequestWithRetry(
  url: string,
  body: any,
  source: string,
  delay = 1000,
  isFormData = false
) {
  const request = new XMLHttpRequest();

  request.open("POST", url);
  if (!isFormData) {
    request.setRequestHeader("Content-type", "application/json");
  }

  request.onload = () => {
    if (request.status >= 200 && request.status < 300) {
      // sucesso silencioso (não loga nada)
      return;
    } else if (request.status === 429) {
      const preview = !isFormData
        ? JSON.stringify(body).slice(0, 100)
        : "[file upload]";
      console.warn(
        `[Discord RATE LIMIT] (${source}) Retentando em ${delay}ms\nConteúdo: ${preview}\nStack:`,
        new Error().stack
      );
      setTimeout(
        () => sendRequestWithRetry(url, body, source, delay * 2, isFormData),
        delay
      );
    } else {
      console.error(
        `[Discord ERROR ${request.status}] (${source}):`,
        request.responseText,
        new Error().stack
      );
    }
  };

  request.onerror = () => {
    console.error(`[Discord NETWORK ERROR] (${source})`, new Error().stack);
  };

  if (isFormData) {
    request.send(body);
  } else {
    request.send(JSON.stringify(body));
  }
}
