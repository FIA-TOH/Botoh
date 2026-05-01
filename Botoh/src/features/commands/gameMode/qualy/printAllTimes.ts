import {
  generalGameMode,
  GeneralGameMode,
} from "../../../changeGameState/changeGameModes";
import { centerText } from "../../../chat/centerText";
import {
  sendErrorMessage,
  sendChatMessage,
  MAX_PLAYER_NAME,
  sendNonLocalizedSmallChatMessage,
  COLORS,
} from "../../../chat/chat";
import { MESSAGES } from "../../../chat/messages";
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

  setTimeout(() => {
    const header = ` P - ${centerText(
      "Name",
      MAX_PLAYER_NAME,
    )} | Best Lap`;
    sendNonLocalizedSmallChatMessage(room, header, toPlayerID, COLORS.ORANGE);
  }, 1000);

  const messages: { text: string; color: number }[] = [];

  orderedList.forEach((p, index: number) => {
    const position = String(index + 1).padStart(2, "0");
    const nameCentered = centerText(p.name, MAX_PLAYER_NAME);
    const displayedTime =
      p.time === Number.MAX_VALUE ? "N/A" : p.time.toFixed(3);
    const line = `${position} - ${nameCentered} | ${displayedTime}`;

    const color = COLORS.WHITE;

    messages.push({ text: line, color });
  });

  messages.forEach((msg, index) => {
    setTimeout(() => {
      sendNonLocalizedSmallChatMessage(room, msg.text, toPlayerID, msg.color);
    }, 1000 + index * 100); // 1s initial delay + 0.1s between each message
  });
}
