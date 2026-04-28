import { sendErrorMessage, sendSuccessMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { getGameState } from "../../changeGameState/gameState";

export let manageTyresEnabled = false;

export function setManageTyresEnabled(enabled: boolean): void {
  manageTyresEnabled = enabled;
}

export function isManageTyresEnabled(): boolean {
  return manageTyresEnabled;
}



export function handleManageTyresCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (!byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.ADMIN_ONLY(), byPlayer.id);
    return;
  }

  const gameState = getGameState();
  if (gameState !== null) {
    sendErrorMessage(room, MESSAGES.ALREADY_STARTED(), byPlayer.id);
    return;
  }

  if (!args[0]) {
    sendErrorMessage(room, MESSAGES.MANAGE_TYRES_MISSING_ARGUMENT(), byPlayer.id);
    return;
  }

  const enableValue = args[0].toLowerCase();
  
  if (enableValue !== "on" && enableValue !== "off") {
    sendErrorMessage(room, MESSAGES.MANAGE_TYRES_INVALID_ARGUMENT(), byPlayer.id);
    return;
  }

  const shouldEnable: boolean = enableValue === "on";

  setManageTyresEnabled(shouldEnable);
  sendSuccessMessage(room, MESSAGES.MANAGE_TYRES_SUCCESS(shouldEnable), byPlayer.id);
}
