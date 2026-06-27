import { afkAdmins } from "../../afk/afkAdmins";
import { sendErrorMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { log } from "../../discord/logger";
import { LEAGUE_MODE } from "../../hostLeague/leagueMode";
import { getAdmins } from "../../utils";
import roomConfig from "../../../../roomconfig.json";

const getPasswordSource = (
  envKey: "PUBLIC_ADMIN_PASSWORD" | "PUBLIC_MOD_PASSWORD" | "LEAGUE_ADMIN_PASSWORD",
  configValue: string
) => {
  if (process.env[envKey]) return "env";
  if (configValue) return "roomconfig";
  return "empty";
};

const getRoomConfig = () => ({
  publicAdminPassword:
    process.env.PUBLIC_ADMIN_PASSWORD || roomConfig.publicAdminPassword || "",
  publicModPassword:
    process.env.PUBLIC_MOD_PASSWORD || roomConfig.publicModPassword || "",
  leagueAdminPassword:
    process.env.LEAGUE_ADMIN_PASSWORD || roomConfig.leagueAdminPassword || "",
});

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
  const providedPassword = args[0];
  const hasProvidedPassword = typeof providedPassword === "string";
  const matchesAdminPassword =
    hasProvidedPassword &&
    SECRET_PASSWORD.length > 0 &&
    providedPassword === SECRET_PASSWORD;
  const matchesModPassword =
    hasProvidedPassword &&
    SECRET_PASSWORD_MOD.length > 0 &&
    providedPassword === SECRET_PASSWORD_MOD;

  log(
    "[admin-command]",
    {
      player: byPlayer.name,
      playerId: byPlayer.id,
      alreadyAdmin: byPlayer.admin,
      leagueMode: LEAGUE_MODE,
      argsCount: args.length,
      providedPasswordLength: providedPassword?.length || 0,
      adminPasswordLength: SECRET_PASSWORD.length,
      modPasswordLength: SECRET_PASSWORD_MOD.length,
      matchesAdminPassword,
      matchesModPassword,
      publicAdminSource: getPasswordSource(
        "PUBLIC_ADMIN_PASSWORD",
        roomConfig.publicAdminPassword
      ),
      publicModSource: getPasswordSource(
        "PUBLIC_MOD_PASSWORD",
        roomConfig.publicModPassword
      ),
      leagueAdminSource: getPasswordSource(
        "LEAGUE_ADMIN_PASSWORD",
        roomConfig.leagueAdminPassword
      ),
      currentAdminCount: getAdmins(room).length,
    },
    { sendToDiscord: false }
  );
  
  if (byPlayer.admin) {
    log(
      "[admin-command] removing admin because player was already admin",
      { player: byPlayer.name, playerId: byPlayer.id },
      { sendToDiscord: false }
    );
    room.setPlayerAdmin(byPlayer.id, false);
    delete afkAdmins[byPlayer.id];
    return;
  }

  if (matchesAdminPassword) {
    log(
      "[admin-command] admin password accepted",
      { player: byPlayer.name, playerId: byPlayer.id },
      { sendToDiscord: false }
    );
    room.setPlayerAdmin(byPlayer.id, true);
    afkAdmins[byPlayer.id] = 0;
    return;
  } else if (matchesModPassword) {
    if (getAdmins(room).length === 0 && !LEAGUE_MODE) {
      log(
        "[admin-command] mod password accepted because public room has no admins",
        { player: byPlayer.name, playerId: byPlayer.id },
        { sendToDiscord: false }
      );
      room.setPlayerAdmin(byPlayer.id, true);
      afkAdmins[byPlayer.id] = 0;
    } else {
      log(
        "[admin-command] mod password rejected",
        {
          player: byPlayer.name,
          playerId: byPlayer.id,
          leagueMode: LEAGUE_MODE,
          currentAdminCount: getAdmins(room).length,
        },
        { sendToDiscord: false }
      );
      sendErrorMessage(room, MESSAGES.ADMIN_ALREADY_IN_ROOM(), byPlayer.id);
    }
  } else {
    log(
      "[admin-command] password rejected",
      { player: byPlayer.name, playerId: byPlayer.id },
      { sendToDiscord: false }
    );
    return;
  }
}
