import { getGameState } from "../../changeGameState/gameState";
import { restorePlayerPersistentAvatar } from "../../changePlayerState/handleAvatar";
import { sendErrorMessage, sendSuccessMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { log } from "../../discord/logger";
import { setScuderiaAvatar } from "../../scuderias/scuderiaAvatar";

export function handleScuderiaAvatarCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject,
) {
  if (!byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.ADMIN_ONLY(), byPlayer.id);
    return;
  }

  if (getGameState() !== null) {
    sendErrorMessage(room, MESSAGES.ALREADY_STARTED(), byPlayer.id);
    return;
  }

  if (!args[0]) {
    sendErrorMessage(room, MESSAGES.SCUDERIA_AVATAR_MISSING_ARGUMENT(), byPlayer.id);
    return;
  }

  const enabledValue = args[0].toLowerCase();
  if (enabledValue !== "true" && enabledValue !== "false") {
    sendErrorMessage(room, MESSAGES.SCUDERIA_AVATAR_INVALID_ARGUMENT(), byPlayer.id);
    return;
  }

  const shouldEnable = enabledValue === "true";
  setScuderiaAvatar(shouldEnable);
  room.getPlayerList().forEach((player) => {
    restorePlayerPersistentAvatar(player.id, room);
  });
  log(`Scuderia avatar ${shouldEnable ? "enabled" : "disabled"} by ${byPlayer.name}`);
  sendSuccessMessage(room, MESSAGES.SCUDERIA_AVATAR_SUCCESS(shouldEnable), byPlayer.id);
}
