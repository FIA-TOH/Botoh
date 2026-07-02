import { afkAdmins } from "../afk/afkAdmins";
import { sendErrorMessage } from "../chat/chat";
import { COMMANDS } from "../commands/handleCommands";
import { MESSAGES } from "../chat/messages";
import {
  getEffectiveLeagueScuderiaId,
  PlayerInfo,
  playerList,
} from "../changePlayerState/playerList";
import { getLeagueScuderia } from "../scuderias/scuderias";
import { log } from "../discord/logger";
import { mute_mode } from "../chat/toggleMuteMode";
import { updatePlayerActivity } from "../afk/afk";
import { sendToWebsite } from "../website/sendToWebsite";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import {
  handlePublicLoginCommand,
  handlePublicRegisterCommand,
  isPublicUserLoggedIn,
  sendPublicLoggedChat,
} from "../public/publicAuth";

function getPlayerScuderia(playerInfo: PlayerInfo) {
  return getLeagueScuderia(getEffectiveLeagueScuderiaId(playerInfo));
}

export function PlayerChat(room: RoomObject) {
  room.onPlayerChat = function (player, message) {
    if (LEAGUE_MODE && /^\s+!login(?:\s|$)/i.test(message)) {
      sendErrorMessage(room, MESSAGES.LOGIN_USAGE(), player.id);
      return false;
    }

    log(`${player.name}: ${message}`);

    if (player.admin) afkAdmins[player.id] = 0;
    updatePlayerActivity(player, room);

    sendToWebsite(player, message);

    const [rawCommand, ...args] = message.trim().split(/\s+/);
    const command = rawCommand.toLowerCase();

    if (!LEAGUE_MODE && (command === "!cadastro" || command === "!cadastrar")) {
      handlePublicRegisterCommand(player, args, room);
      return false;
    }

    if (!LEAGUE_MODE && command === "!login") {
      handlePublicLoginCommand(player, args, room);
      return false;
    }

    if (command[0] !== "!") {
      if (mute_mode && !player.admin) {
        sendErrorMessage(room, MESSAGES.IN_MUTE_MODE(), player.id);
        return false;
      }

      if (!LEAGUE_MODE && isPublicUserLoggedIn(player)) {
        sendPublicLoggedChat(room, player, message);
        return false;
      }

      const playerInfo = playerList[player.id];
      const team = playerInfo ? getPlayerScuderia(playerInfo) : null;

      const teamName = team?.name || "??";
      const teamColor = team?.color || 0xb3b3b3;

      if (team) {
        room.sendAnnouncement(
          `[${teamName}] ${player.name}: ${message}`,
          undefined,
          teamColor
        );
      } else {
        return true;
      }
      return false;
    }

    if (COMMANDS[command] === undefined) {
      sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), player.id);
      return false;
    }

    COMMANDS[command](player, args, room);
    return false;
  };
}
