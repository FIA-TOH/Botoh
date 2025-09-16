import { updatePlayerTime } from "../../changeGameState/qualy/playerTime";
import { playerList } from "../../changePlayerState/playerList";
import {
  sendErrorMessage,
  sendNonLocalizedSmallChatMessage,
} from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";

export function handleClearTimeCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (!byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }

  if (args.length === 0) {
    sendErrorMessage(room, MESSAGES.CLEAR_TIME_USAGE(), byPlayer.id);
    return;
  }

  const argsString = args.join(" ");

  const listPlayer = room.getPlayerList();
  const player = listPlayer.find(
    (p) => p.name.toLowerCase() === argsString.toLowerCase()
  );

  if (player) {
    playerList[player.id].bestTime = Number.MAX_VALUE;
  } else {
    room.sendAnnouncement(
      "IMPORTANT: The player isn't in the room at the moment, reset their time when they enter again."
    );
  }

  updatePlayerTime(argsString, Number.MAX_VALUE, Number.MAX_VALUE, null);

  sendNonLocalizedSmallChatMessage(
    room,
    "Cleared " + argsString + "'s best time",
    byPlayer.id
  );
}
