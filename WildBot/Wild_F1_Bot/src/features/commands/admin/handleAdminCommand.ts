import { afkAdmins } from "../../afk/afkAdmins";
import { sendErrorMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { LEAGUE_MODE } from "../../hostLeague/leagueMode";
import { getAdmins } from "../../utils";
import {
  leagueAdminPassword,
  publicAdminPassword,
  publicModPassword,
} from "../../../../roomconfig.json";

export function handleAdminCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (byPlayer.admin) {
    room.setPlayerAdmin(byPlayer.id, false);
    delete afkAdmins[byPlayer.id];
    return;
  }

  const SECRET_PASSWORD = LEAGUE_MODE
    ? leagueAdminPassword
    : publicAdminPassword;
  const SECRET_PASSWORD_MOD = LEAGUE_MODE
    ? leagueAdminPassword
    : publicModPassword;

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
