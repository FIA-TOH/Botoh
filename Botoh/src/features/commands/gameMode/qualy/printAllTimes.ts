import {
  generalGameMode,
  GeneralGameMode,
} from "../../../changeGameState/changeGameModes";
import { playerList } from "../../../changePlayerState/playerList";
import { centerText } from "../../../chat/centerText";
import {
  sendErrorMessage,
  sendChatMessage,
  MAX_PLAYER_NAME,
  sendNonLocalizedSmallChatMessage,
} from "../../../chat/chat";
import { MESSAGES } from "../../../chat/messages";
import { leagueScuderia } from "../../../scuderias/scuderias";
import { getPlayersOrderedByQualiTime } from "./playerTime";

const HAXBALL_MSG_LIMIT = 124;
const TEAM_COL_WIDTH = 12;

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

  let messageBuffer = ` P - ${centerText("Name", MAX_PLAYER_NAME)} | ${centerText(
    "Team",
    TEAM_COL_WIDTH,
  )} | Best Lap\n`;

  orderedList.forEach((p, index: number) => {
    const position = String(index + 1).padStart(2, "0");
    const nameCentered = centerText(p.name, MAX_PLAYER_NAME);

    // Resolve team: prefer p.team (from quali list), fallback to playerList by id
    const teamKey =
      p.team ??
      (typeof p.id === "number" ? playerList[p.id]?.leagueScuderia : null) ??
      null;

    let teamTag = "";
    if (teamKey) {
      const key = teamKey as keyof typeof leagueScuderia;
      teamTag = leagueScuderia[key]?.tag ?? String(teamKey);
    }

    const teamCentered = centerText(teamTag, TEAM_COL_WIDTH);
    const displayedTime =
      p.time === Number.MAX_VALUE ? "N/A" : p.time.toFixed(3);
    const line = `${position} - ${nameCentered} | ${teamCentered} | ${displayedTime}\n`;

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
