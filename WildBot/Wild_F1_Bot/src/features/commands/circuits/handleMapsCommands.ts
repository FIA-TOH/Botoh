import { sendChatMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { CIRCUITS } from "../../zones/maps";

export function handleMapsCommand(
  byPlayer: PlayerObject,
  _: string[],
  room: RoomObject
) {
  sendChatMessage(
    room,
    MESSAGES.LIST_MAPS(
      `${CIRCUITS.map((c) => c.info)
        .map((c, i) => c.name + " [" + i + "]")
        .join("\n")}`
    ),
    byPlayer.id
  );
}
