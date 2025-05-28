import { afkAdmins } from "../afk/afkAdmins";
import { sendErrorMessage } from "../chat/chat";
import { COMMANDS } from "../commands/handleCommands";
import { MESSAGES } from "../chat/messages";
import { playerList } from "../changePlayerState/playerList";
import { LeagueTeam } from "../teams/teams";
import { log } from "../discord/logger";
import { mute_mode } from "../chat/toggleMuteMode";

export function PlayerChat(room: RoomObject) {
  room.onPlayerChat = function (player, message) {
    log(`${player.name}: ${message}`);
    if (player.admin) afkAdmins[player.id] = 0;

    const command = message.toLowerCase().split(" ")[0];
    const args = message.toLowerCase().split(" ").slice(1);

    if (command[0] !== "!") {
      if (mute_mode && !player.admin) {
        sendErrorMessage(room, MESSAGES.IN_MUTE_MODE(), player.id);
        return false;
      }
      const playerInfo = playerList[player.id];
      if (playerInfo?.leagueTeam) {
        const teamName = LeagueTeam[playerInfo.leagueTeam]?.name || "??";
        const teamColor = LeagueTeam[playerInfo.leagueTeam]?.color || undefined;

        room.sendAnnouncement(
          `[${teamName}] ${player.name}: ${message}`,
          undefined,
          teamColor
        );
        return false;
      }
      return true;
    }

    if (COMMANDS[command] === undefined) {
      sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), player.id);
      return false;
    }

    COMMANDS[command](player, args, room);
    return false;
  };
}
