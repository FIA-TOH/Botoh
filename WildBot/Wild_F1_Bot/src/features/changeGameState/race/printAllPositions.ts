import {
  sendErrorMessage,
  MAX_PLAYER_NAME,
  sendNonLocalizedSmallChatMessage,
} from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { log } from "../../discord/logger";
import { gameMode, GameMode } from "../changeGameModes";
import { positionList } from "./positionList";

export function printAllPositions(
  room: RoomObject,
  toPlayerID?: number,
  sendToDiscord?: boolean
) {
  if (gameMode == GameMode.QUALY || gameMode == GameMode.TRAINING) {
    sendErrorMessage(room, MESSAGES.POSITIONS_IN_QUALI(), toPlayerID);
    return false;
  }
  const headerSpaces = (MAX_PLAYER_NAME - 4) / 2.0;
  const headerLeftSpaces = " ".repeat(Math.ceil(headerSpaces));
  const headerRightSpaces = " ".repeat(Math.trunc(headerSpaces));
  let i = 1;

  sendNonLocalizedSmallChatMessage(
    room,
    ` P - ${headerLeftSpaces}Name${headerRightSpaces} | Pits | Best Lap`,
    toPlayerID
  );
  log("positionList: ", { sendToDiscord: sendToDiscord ?? true });
  console.log(positionList);

  positionList.forEach((p) => {
    const spaces = (MAX_PLAYER_NAME - p.name.length) / 2.0;
    const leftSpaces = " ".repeat(Math.ceil(spaces));
    const rightSpaces = " ".repeat(Math.trunc(spaces));

    const position = i.toString().padStart(2, "0");
    const pits = p.pits.toString().padStart(2, "0");
    const time = p.time < 999.999 ? p.time.toFixed(3) : "N/A";

    sendNonLocalizedSmallChatMessage(
      room,
      `${position} - ${leftSpaces}${p.name}${rightSpaces} |  ${pits}  | ${time}`,
      toPlayerID
    );
    i++;
  });

  if (i === 1) {
    sendErrorMessage(room, MESSAGES.NO_POSITIONS(), toPlayerID);
  }
}
