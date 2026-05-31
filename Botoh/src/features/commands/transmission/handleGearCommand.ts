import { playerList } from "../../changePlayerState/playerList";
import { sendMessage, sendErrorMessage, sendSuccessMessage, COLORS, FONTS } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { ensureTransmissionState } from "../../transmission/state";
import { reportGearInfo } from "../../transmission/hudChat";
import { GearboxType } from "../../transmission/types";

/** Maps user-facing aliases to internal GearboxType values. */
const MODE_ALIASES: Record<string, GearboxType> = {
  manual: GearboxType.MANUAL_SEQUENTIAL,
  auto:   GearboxType.AUTOMATIC,
};

/**
 * `!gear`          → shows current transmission status (gear, rpm, mode).
 * `!gear manual`   → switches to manual-sequential mode.
 * `!gear auto`     → switches to automatic mode.
 */
export function handleGearCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject,
) {
  const playerInfo = playerList[byPlayer.id];
  if (!playerInfo) return;

  const tx = ensureTransmissionState(playerInfo);
  if (!tx) {
    sendMessage(
      room,
      MESSAGES.GEAR_INFO("-", "-", "-", "-", "n/a"),
      byPlayer.id,
      COLORS.GREY,
      FONTS.SMALL_ITALIC,
    );
    return;
  }

  const sub = args[0]?.toLowerCase();

  // No subcommand → just print status.
  if (!sub) {
    reportGearInfo(room, byPlayer.id, tx.state, tx.config);
    return;
  }

  // Mode change subcommand.
  const newMode = MODE_ALIASES[sub];
  if (!newMode) {
    sendErrorMessage(room, MESSAGES.GEAR_MODE_INVALID(sub), byPlayer.id);
    return;
  }

  tx.state.mode = newMode;
  // Reset any in-flight shift so the mode switch takes effect immediately.
  tx.state.isShifting = false;
  tx.state.pendingShiftDirection = 0;
  tx.state.shiftLossApplied = false;

  sendSuccessMessage(room, MESSAGES.GEAR_MODE_CHANGED(sub), byPlayer.id);
}
