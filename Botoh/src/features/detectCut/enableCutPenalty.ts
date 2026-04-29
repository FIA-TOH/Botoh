import { COLORS } from "../chat/chat";

export let detectCutEnabled = true;
export let softCutPenalty = false;

export function enableCutPenalty(enable: boolean) {
  detectCutEnabled = enable;

  if (!enable) {
    softCutPenalty = false;
  }
}

export function enableSoftCutPenalty(enable: boolean, room: RoomObject) {
  if (enable && !detectCutEnabled) {
    room.sendAnnouncement(
      "softCutPenalty cannot be enabled when detectCutEnabled is false.",
      undefined,
      COLORS.RED,
    );
    softCutPenalty = false;
    return;
  }

  softCutPenalty = enable;
}
