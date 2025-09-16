import { playerList } from "../../changePlayerState/playerList";
import { sendErrorMessage, sendSuccessMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";

export function handleLanguageCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (args.length === 0) {
    sendErrorMessage(room, MESSAGES.LANG_USAGE(), byPlayer.id);
    return;
  }

  const lang = args[0].toLowerCase();
  if (
    lang != "en" &&
    lang != "es" &&
    lang != "fr" &&
    lang != "tr" &&
    lang != "pt"
  ) {
    sendErrorMessage(room, MESSAGES.LANG_USAGE(), byPlayer.id);
    return;
  }

  playerList[byPlayer.id].language = lang;
  sendSuccessMessage(room, MESSAGES.LANG_CHANGED(), byPlayer.id);
}
