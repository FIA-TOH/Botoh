import { playerList } from "../../changePlayerState/playerList";
import {
  sendChatMessage,
  sendNonLocalizedSmallChatMessage,
} from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { COMMANDS_BY_LANGUAGE } from "../handleCommands";

export function handleCommandsCommand(
  byPlayer: PlayerObject,
  _: string[],
  room: RoomObject
) {
  if (byPlayer.admin) {
    sendChatMessage(room, MESSAGES.AVAILABLE_COMMANDS(), byPlayer.id);
    let i = 0;
    let msg = "";
    Object.keys(COMMANDS_BY_LANGUAGE[playerList[byPlayer.id].language]).forEach(
      (command) => {
        i = (i + 1) % 3;
        msg += `${command}, `;
        if (i === 0) {
          sendNonLocalizedSmallChatMessage(room, msg, byPlayer.id);
          msg = "";
        }
      }
    );
    return;
  }

  sendChatMessage(room, MESSAGES.NON_ADMIN_COMMANDS(), byPlayer.id);
}
