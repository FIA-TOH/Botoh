import { log } from "console";
import {
  generalGameMode,
  GeneralGameMode,
  gameMode,
  GameMode,
} from "../../../changeGameState/changeGameModes";
import {
  sendErrorMessage,
  MAX_PLAYER_NAME,
  sendNonLocalizedSmallChatMessage,
  COLORS,
} from "../../../chat/chat";
import { MESSAGES } from "../../../chat/messages";
import { getBestPit } from "../../../tires&pits/trackBestPit";
import { getBestLap } from "../../../zones/laps/trackBestLap";
import { positionList } from "./positionList";

const HAXBALL_MSG_LIMIT = 124;

export function printAllPositions(
  room: RoomObject,
  toPlayerID?: number,
  sendToDiscord?: boolean,
) {
  if (
    generalGameMode === GeneralGameMode.GENERAL_QUALY ||
    gameMode == GameMode.TRAINING
  ) {
    sendErrorMessage(room, MESSAGES.POSITIONS_IN_QUALI(), toPlayerID);
    return false;
  }

  const headerSpaces = (MAX_PLAYER_NAME - 4) / 2.0;
  const headerLeftSpaces = " ".repeat(Math.ceil(headerSpaces));
  const headerRightSpaces = " ".repeat(Math.trunc(headerSpaces));

  setTimeout(() => {
    const header = ` P - ${headerLeftSpaces}Name${headerRightSpaces} | Pits    | Best Lap`;
    sendNonLocalizedSmallChatMessage(room, header, toPlayerID, COLORS.ORANGE);
  }, 1000);

  let i = 1;
  const messages: { text: string; color: number }[] = [];

  positionList.forEach((p) => {
    const spaces = (MAX_PLAYER_NAME - p.name.length) / 2.0;
    const leftSpaces = " ".repeat(Math.ceil(spaces));
    const rightSpaces = " ".repeat(Math.trunc(spaces));

    const position = i.toString().padStart(2, "0");
    const pits = p.pits.toString().padStart(2, "0");
    const time = p.time < 999.999 ? p.time.toFixed(3) : "N/A";

    const line = `${position} - ${leftSpaces}${p.name}${rightSpaces} | ${pits} | ${time}`;

    let color = COLORS.WHITE; 
    if (i === 1) {
      color = COLORS.GOLD;
    } else if (i === 2) {
      color = COLORS.GREY;
    } else if (i === 3) {
      color = COLORS.BROWN;
    }

    messages.push({ text: line, color });
    i++;
  });

  if (i === 1) {
    sendErrorMessage(room, MESSAGES.NO_POSITIONS(), toPlayerID);
    return;
  }

  messages.forEach((msg, index) => {
    setTimeout(() => {
      sendNonLocalizedSmallChatMessage(room, msg.text, toPlayerID, msg.color);
    }, 1000 + index * 100);
  });

  const additionalMessages: { text: string; color: number }[] = [];

  const bestLap = getBestLap();
  if (bestLap) {
    additionalMessages.push({
      text: `⚡ Fastest Lap: ${bestLap.playerName} - ${bestLap.lapTime.toFixed(3)}s (Lap ${bestLap.lapNumber})`,
      color: COLORS.PURPLE,
    });
  }

  const bestPit = getBestPit();
  if (bestPit) {
    additionalMessages.push({
      text: `🔧 Fastest Pit: ${bestPit.playerName} - ${bestPit.pitTime.toFixed(3)}s (Stop ${bestPit.pitNumber})`,
      color: COLORS.PINK,
    });
  }

  additionalMessages.forEach((msg, index) => {
    setTimeout(() => {
      sendNonLocalizedSmallChatMessage(room, msg.text, toPlayerID, msg.color);
    }, 1000 + (messages.length + index) * 100);
  });

  log("positionList: ", { sendToDiscord: sendToDiscord ?? true });
  console.log(positionList);
}
