import { afkAdmins } from "../afk/afkAdmins";
import { sendErrorMessage } from "../chat/chat";
import { COMMANDS } from "../commands/handleCommands";
import { MESSAGES } from "../chat/messages";
import { PlayerInfo, playerList } from "../changePlayerState/playerList";
import { leagueScuderia } from "../scuderias/scuderias";
import { log } from "../discord/logger";
import { mute_mode } from "../chat/toggleMuteMode";
import { updatePlayerActivity } from "../afk/afk";

import { sendDiscordPlayerChat } from "../discord/discord";

function getPlayerScuderia(playerInfo: PlayerInfo) {
  if (!playerInfo.leagueScuderia) return null;
  const scuderiaKey = playerInfo.leagueScuderia as keyof typeof leagueScuderia;
  if (!leagueScuderia.hasOwnProperty(scuderiaKey)) return null;
  return leagueScuderia[scuderiaKey];
}

export function PlayerChat(room: RoomObject) {
  room.onPlayerChat = function (player, message) {
    log(`${player.name}: ${message}`);

    if (player.admin) afkAdmins[player.id] = 0;
    updatePlayerActivity(player);

    const command = message.toLowerCase().split(" ")[0];
    const args = message.toLowerCase().split(" ").slice(1);

    if (command[0] !== "!") {
      // sendDiscordPlayerChat(player, message);
      if (mute_mode && !player.admin) {
        sendErrorMessage(room, MESSAGES.IN_MUTE_MODE(), player.id);
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

    // Comando
    if (COMMANDS[command] === undefined) {
      sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), player.id);
      return false;
    }

    COMMANDS[command](player, args, room);
    return false;
  };
}
