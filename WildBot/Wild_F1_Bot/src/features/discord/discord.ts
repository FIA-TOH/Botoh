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

export function sendDiscordLog(message: string) {
  const LOG_URL = LEAGUE_MODE ? LEAGUE_LOG_URL : PUBLIC_LOG_URL;
  const request = new XMLHttpRequest();
  const sanitizedMessage = message.replace(/@(?=[a-zA-Z])/g, "@ ");
  const timestampedMessage = `${sanitizedMessage} - ${getTimestamp()}`;

  request.open("POST", LOG_URL);
  request.setRequestHeader("Content-type", "application/json");
  const params = {
    content: timestampedMessage,
  };
  request.send(JSON.stringify(params));
}

export function sendDiscordChat(message: string) {
  const MESSAGES_URL = LEAGUE_MODE ? LEAGUE_CHAT_URL : PUBLIC_CHAT_URL;
  const request = new XMLHttpRequest();
  const sanitizedMessage = message.replace(/@(?=[a-zA-Z])/g, "@ ");
  request.open("POST", MESSAGES_URL);
  request.setRequestHeader("Content-type", "application/json");
  const params = {
    content: sanitizedMessage,
  };
  request.send(JSON.stringify(params));
}

function generateFileName() {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0"); // January is 0!
  const year = now.getFullYear();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `HBReplay-${day}-${month}-${year}-${hours}h${minutes}m - [${ACTUAL_CIRCUIT.info.name}].hbr2`;
}
export function sendDiscordReplay(replay: Uint8Array) {
  const REPLAYS_URL = LEAGUE_MODE ? LEAGUE_REPLAY_URL : PUBLIC_REPLAY_URL;
  const request = new XMLHttpRequest();
  request.open("POST", REPLAYS_URL);

  const arrayBuffer: ArrayBuffer = replay.buffer.slice(
    replay.byteOffset,
    replay.byteOffset + replay.byteLength
  ) as ArrayBuffer;

  const blob = new Blob([arrayBuffer], { type: "application/octet-stream" });

  const formData = new FormData();
  formData.append("file", blob, generateFileName());

  request.send(formData);
}
