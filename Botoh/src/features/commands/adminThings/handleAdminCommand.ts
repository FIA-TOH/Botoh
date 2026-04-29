import { afkAdmins } from "../../afk/afkAdmins";
import { sendErrorMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { LEAGUE_MODE } from "../../hostLeague/leagueMode";
import { getAdmins } from "../../utils";

const getRoomConfig = () => ({
  publicAdminPassword: process.env.PUBLIC_ADMIN_PASSWORD || "",
  publicModPassword: process.env.PUBLIC_MOD_PASSWORD || "",
  leagueAdminPassword: process.env.LEAGUE_ADMIN_PASSWORD || ""
});

const roomConfigSecure = getRoomConfig();

export function handleAdminCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  const currentConfig = getRoomConfig();
  
  const SECRET_PASSWORD = LEAGUE_MODE
    ? currentConfig.leagueAdminPassword
    : currentConfig.publicAdminPassword;
  const SECRET_PASSWORD_MOD = LEAGUE_MODE
    ? currentConfig.leagueAdminPassword
    : currentConfig.publicModPassword;
  
  if (byPlayer.admin) {
    room.setPlayerAdmin(byPlayer.id, false);
    delete afkAdmins[byPlayer.id];
    return;
  }

  if (args[0] === SECRET_PASSWORD) {
    room.setPlayerAdmin(byPlayer.id, true);
    afkAdmins[byPlayer.id] = 0;
    return;
  } else if (args[0] === SECRET_PASSWORD_MOD) {
    if (getAdmins(room).length === 0 && !LEAGUE_MODE) {
      room.setPlayerAdmin(byPlayer.id, true);
      afkAdmins[byPlayer.id] = 0;
    } else {
      sendErrorMessage(room, MESSAGES.ADMIN_ALREADY_IN_ROOM(), byPlayer.id);
    }
  } else {
    return;
  }
}
