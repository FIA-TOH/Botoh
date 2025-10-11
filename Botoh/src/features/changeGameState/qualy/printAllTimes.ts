import { centerText } from "../../chat/centerText";
import {
  MAX_PLAYER_NAME,
  sendChatMessage,
  sendErrorMessage,
  sendNonLocalizedSmallChatMessage,
} from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import {
  GameMode,
  gameMode,
  GeneralGameMode,
  generalGameMode,
} from "../changeGameModes";
import { getPlayersOrderedByQualiTime } from "./playerTime";

const HAXBALL_MSG_LIMIT = 124;

export function printAllTimes(room: RoomObject, toPlayerID?: number) {
  if (generalGameMode === GeneralGameMode.GENERAL_RACE) {
    sendErrorMessage(room, MESSAGES.TIMES_IN_RACE(), toPlayerID);
    return;
  }

  const orderedList = getPlayersOrderedByQualiTime();

  if (orderedList.length === 0) {
    sendChatMessage(room, MESSAGES.NO_TIMES(), toPlayerID);
    return;
  }

  let messageBuffer = ` P - ${centerText(
    "Name",
    MAX_PLAYER_NAME
  )} | Best Lap\n`;

  orderedList.forEach((p, index: number) => {
    const position = String(index + 1).padStart(2, "0");
    const nameCentered = centerText(p.name, MAX_PLAYER_NAME);
    const displayedTime =
      p.time === Number.MAX_VALUE ? "N/A" : p.time.toFixed(3);
    const line = `${position} - ${nameCentered} | ${displayedTime}\n`;

    if (messageBuffer.length + line.length > HAXBALL_MSG_LIMIT) {
      sendNonLocalizedSmallChatMessage(room, messageBuffer, toPlayerID);
      messageBuffer = "";
    }

    messageBuffer += line;
  });

  if (messageBuffer.length > 0) {
    sendNonLocalizedSmallChatMessage(room, messageBuffer, toPlayerID);
  }
}
