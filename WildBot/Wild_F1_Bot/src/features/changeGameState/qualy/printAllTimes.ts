import { centerText } from "../../chat/centerText";
import {
  MAX_PLAYER_NAME,
  sendChatMessage,
  sendErrorMessage,
  sendNonLocalizedSmallChatMessage,
} from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { GameMode, gameMode } from "../changeGameModes";
import { getPlayersOrderedByQualiTime } from "./playerTime";

export function printAllTimes(room: RoomObject, toPlayerID?: number) {
  if (![GameMode.QUALY, GameMode.TRAINING].includes(gameMode)) {
    sendErrorMessage(room, MESSAGES.TIMES_IN_RACE(), toPlayerID);
    return;
  }

  const orderedList = getPlayersOrderedByQualiTime();

  if (orderedList.length === 0) {
    sendChatMessage(room, MESSAGES.NO_TIMES(), toPlayerID);
    return;
  }

  sendNonLocalizedSmallChatMessage(
    room,
    ` P -       Name       | Best Lap`,
    toPlayerID
  );

  orderedList.forEach((p, index: number) => {
    const position = String(index + 1).padStart(2, "0");
    const nameCentered = centerText(p.name, MAX_PLAYER_NAME);
    const displayedTime =
      p.time === Number.MAX_VALUE ? "N/A" : p.time.toFixed(3);

    sendNonLocalizedSmallChatMessage(
      room,
      `${position} - ${nameCentered} | ${displayedTime}`,
      toPlayerID
    );
  });
}
