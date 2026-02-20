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
} from "../../../chat/chat";
import { MESSAGES } from "../../../chat/messages";
import { getBestPit } from "../../../tires&pits/trackBestPit";
import { getBestLap } from "../../../zones/laps/trackBestLap";
import { positionList } from "./positionList";
import { saveStandingsHtml } from "./standingsHtml";

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

  // add a small fixed-width TEAM column
  const TEAM_WIDTH = 8;
  let messageBuffer = ` P - ${headerLeftSpaces}Name${headerRightSpaces} | Team    | Pits | Best Lap\n`;
  let i = 1;

  positionList.forEach((p) => {
    const spaces = (MAX_PLAYER_NAME - p.name.length) / 2.0;
    const leftSpaces = " ".repeat(Math.ceil(spaces));
    const rightSpaces = " ".repeat(Math.trunc(spaces));

    const position = i.toString().padStart(2, "0");
    const pits = p.pits.toString().padStart(2, "0");
    const time = p.time < 999.999 ? p.time.toFixed(3) : "N/A";

    // format team into fixed width
    const rawTeam = (p.team ?? "").toString();
    const team = rawTeam.length > TEAM_WIDTH ? rawTeam.substring(0, TEAM_WIDTH) : rawTeam.padEnd(TEAM_WIDTH, " ");

    const line = `${position} - ${leftSpaces}${p.name}${rightSpaces} | ${team} | ${pits} | ${time}\n`;

    if (messageBuffer.length + line.length > HAXBALL_MSG_LIMIT) {
      sendNonLocalizedSmallChatMessage(room, messageBuffer, toPlayerID);
      messageBuffer = "";
    }

    messageBuffer += line;
    i++;
  });

  if (i === 1) {
    sendErrorMessage(room, MESSAGES.NO_POSITIONS(), toPlayerID);
    return;
  }

  const bestLap = getBestLap();
  if (bestLap) {
    messageBuffer += `⚡ Fastest Lap: ${
      bestLap.playerName
    } - ${bestLap.lapTime.toFixed(3)}s (Lap ${bestLap.lapNumber})\n`;
  }

  const bestPit = getBestPit();
  if (bestPit) {
    messageBuffer += `🔧 Fastest Pit: ${
      bestPit.playerName
    } - ${bestPit.pitTime.toFixed(3)}s (Stop ${bestPit.pitNumber})\n`;
  }

  log("positionList: ", { sendToDiscord: sendToDiscord ?? true });
  console.log(positionList);

  if (messageBuffer.length > 0) {
    sendNonLocalizedSmallChatMessage(room, messageBuffer, toPlayerID);
  }
  // Save standings HTML when positionList updates
  saveStandingsHtml();
}
