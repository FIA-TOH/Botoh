import { ACTUAL_CIRCUIT } from "../../roomFeatures/stadiumChange";
import { BANKING_DEFAULTS, configureBanking, getBankingSettings, isBankingEnabled, resetBanking, setBankingEnabled } from "../../speed/banking";
import { controlPlayerSpeed } from "../../speed/handleSpeed";
import { getPlayerAndDiscs } from "../../playerFeatures/getPlayerAndDiscs";
import { getRunningPlayers } from "../../utils";
import { sendErrorMessage, sendSuccessMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";

function showStatus(player: PlayerObject, room: RoomObject) {
  const zones = ACTUAL_CIRCUIT?.info.bankingZones ?? [];
  if (!zones.length) {
    sendSuccessMessage(room, MESSAGES.BANKING_STATUS(isBankingEnabled(), "—"), player.id);
    return;
  }
  zones.forEach((zone) => {
    const settings = Object.entries(getBankingSettings(zone)).map(([key, value]) => `${key}=${Number(value.toFixed(6))}`).join(" | ");
    sendSuccessMessage(room, MESSAGES.BANKING_STATUS(isBankingEnabled(), `${zone.id}: ${settings}`), player.id);
  });
}

function refresh(room: RoomObject) {
  if (room.getScores()) controlPlayerSpeed(getRunningPlayers(getPlayerAndDiscs(room)), room);
}

export function handleBankingCommand(player: PlayerObject, args: string[], room: RoomObject) {
  if (!player.admin) { sendErrorMessage(room, MESSAGES.ADMIN_ONLY(), player.id); return; }
  const value = args[0]?.toLowerCase() ?? "status";
  if (args.length > 1 || !["on", "off", "status"].includes(value)) {
    sendErrorMessage(room, MESSAGES.BANKING_USAGE(), player.id); return;
  }
  if (value !== "status") { setBankingEnabled(value === "on"); refresh(room); }
  showStatus(player, room);
}

export function handleBankingSetCommand(player: PlayerObject, args: string[], room: RoomObject) {
  if (!player.admin) { sendErrorMessage(room, MESSAGES.ADMIN_ONLY(), player.id); return; }
  const zone = ACTUAL_CIRCUIT?.info.bankingZones?.find((zone) => zone.id === args[0]);
  if (!zone) { sendErrorMessage(room, MESSAGES.BANKING_CONFIG_USAGE(Object.keys(BANKING_DEFAULTS).join(", ")), player.id); return; }
  if (args.length === 2 && (args[1] === "reset" || args[1] === "status")) {
    if (args[1] === "reset") { resetBanking(zone); refresh(room); }
  } else if (args.length === 3 && args[2].trim() !== "" && configureBanking(zone, args[1], Number(args[2].replace(",", ".")))) {
    refresh(room);
  } else {
    sendErrorMessage(room, MESSAGES.BANKING_CONFIG_USAGE(Object.keys(BANKING_DEFAULTS).join(", ")), player.id); return;
  }
  showStatus(player, room);
}
