import { setWECRaceDuration, WEC_RACE_DURATION_SECONDS } from "../../../changeGameState/wecRace";
import { sendErrorMessage, sendSuccessMessage } from "../../../chat/chat";
import { MESSAGES } from "../../../chat/messages";

export function handleWECTimeCommand(player: PlayerObject, args: string[], room: RoomObject) {
  if (!player.admin) {
    sendErrorMessage(room, MESSAGES.ADMIN_ONLY(), player.id);
    return;
  }
  if (args.length === 0) {
    sendSuccessMessage(room, MESSAGES.WEC_RACE_FORMAT(WEC_RACE_DURATION_SECONDS), player.id);
    return;
  }
  if (room.getScores() !== null) {
    sendErrorMessage(room, MESSAGES.ALREADY_STARTED(), player.id);
    return;
  }
  if (args.length !== 1 || !/^\d+$/.test(args[0]) || !setWECRaceDuration(Number(args[0]))) {
    sendErrorMessage(room, MESSAGES.WEC_TIME_USAGE(), player.id);
    return;
  }
  sendSuccessMessage(room, MESSAGES.WEC_RACE_FORMAT(WEC_RACE_DURATION_SECONDS), player.id);
}
