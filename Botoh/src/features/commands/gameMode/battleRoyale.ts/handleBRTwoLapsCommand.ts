import { sendErrorMessage } from "../../../chat/chat";
import { MESSAGES } from "../../../chat/messages";
import { setBattleRoyaleTwoLaps } from "../../gameMode/battleRoyale.ts/handleBattleRoyaleLaps";

export function handleBRTwoLapsCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject,
) {
  if (!byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }

  if (room.getScores() !== null) {
    sendErrorMessage(room, MESSAGES.ALREADY_STARTED(), byPlayer.id);
    return;
  }

  const value = Number(args[0]);

  if (!Number.isInteger(value) || value < 0) {
    room.sendAnnouncement(
      "Usage: !br_twolaps <number >= 0>",
      byPlayer.id,
      0xff0000,
    );
    return;
  }
  setBattleRoyaleTwoLaps(value);
  room.sendAnnouncement(`Battle Royale two laps set to ${value}`, byPlayer.id);
}
