import { sendErrorMessage } from "../../chat/chat";
import { MESSAGES, getPlayerLanguage } from "../../chat/messages";
import { log } from "../../discord/logger";
import { enableNewPitSystem } from "../../tires&pits/newPitSystem/newPitManager";

export function handlePitCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (!byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.ADMIN_ONLY(), byPlayer.id);
    return;
  }

  if (!args[0]) {
    sendErrorMessage(room, MESSAGES.PIT_MISSING_ARGUMENT(), byPlayer.id);
    return;
  }

  const pitType = args[0].toLowerCase();
  const validPits = ['old', 'new'];

  if (!validPits.includes(pitType)) {
    sendErrorMessage(room, MESSAGES.PIT_INVALID_ARGUMENT(), byPlayer.id);
    return;
  }

  if (pitType === 'old') {
    applyOldPitConfig(room, byPlayer);
  } else if (pitType === 'new') {
    applyNewPitConfig(room, byPlayer);
  }

  const message = MESSAGES.PIT_SUCCESS(pitType);
  const playerLang = getPlayerLanguage(byPlayer.id);
  room.sendAnnouncement(message[playerLang as keyof typeof message], byPlayer.id, 0x00FF00, "bold");
}

function applyOldPitConfig(room: RoomObject, byPlayer: PlayerObject) {
  log(`Old pit configuration applied by ${byPlayer.name}`);
  enableNewPitSystem(false);
}

function applyNewPitConfig(room: RoomObject, byPlayer: PlayerObject) {
  log(`New pit configuration applied by ${byPlayer.name}`);
  enableNewPitSystem(true);
}
