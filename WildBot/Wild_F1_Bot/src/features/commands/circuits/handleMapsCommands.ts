import { sendChatMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { CIRCUITS } from "../../zones/maps";

const HAXBALL_MSG_LIMIT = 250;

export function handleMapsCommand(
  byPlayer: PlayerObject,
  _: string[],
  room: RoomObject
) {
  const mapsList = CIRCUITS.map((c, i) => {
    return `[${i.toString().padStart(2, "0")}] ${c.info.name}`;
  });

  const fullText = mapsList.join("\n");

  const chunks: string[] = [];
  let currentChunk = "";

  for (const line of mapsList) {
    if ((currentChunk + "\n" + line).length > HAXBALL_MSG_LIMIT) {
      chunks.push(currentChunk);
      currentChunk = line;
    } else {
      currentChunk += (currentChunk ? "\n" : "") + line;
    }
  }
  if (currentChunk) chunks.push(currentChunk);

  chunks.forEach((chunk, idx) => {
    sendChatMessage(room, MESSAGES.LIST_MAPS(chunk), byPlayer.id);
  });
}
