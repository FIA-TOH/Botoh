import { COLORS, FONTS, SOUNDS } from "../../chat/chat";
import { getPlayerLanguage, MESSAGES } from "../../chat/messages";
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

  const language = getPlayerLanguage(byPlayer.id);
  const fullText = MESSAGES.LIST_MAPS(mapsList.join("\n"))[language];

  const chunks: string[] = [];
  let currentChunk = "";

  for (const line of fullText.split("\n")) {
    if ((currentChunk + "\n" + line).length > HAXBALL_MSG_LIMIT) {
      chunks.push(currentChunk);
      currentChunk = line;
    } else {
      currentChunk += (currentChunk ? "\n" : "") + line;
    }
  }
  if (currentChunk) chunks.push(currentChunk);

  chunks.forEach((chunk) => {
    room.sendAnnouncement(
      chunk,
      byPlayer.id,
      COLORS.WHITE,
      FONTS.NORMAL,
      SOUNDS.CHAT,
    );
  });
}
