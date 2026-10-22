import { playerList } from "../../../changePlayerState/playerList";
import { handleAvatar, Situacions } from "../../../changePlayerState/handleAvatar";
import { sendErrorMessage, sendSuccessMessage } from "../../../chat/chat";
import { MESSAGES } from "../../../chat/messages";
import { isWECModeEnabled } from "../../../changeGameState/wecMode";

export function handleCategoryCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject,
) {
  if (!isWECModeEnabled()) {
    sendErrorMessage(room, MESSAGES.CATEGORY_WEC_ONLY(), byPlayer.id);
    return;
  }

  const value = args[0]?.toLowerCase();
  if (args.length !== 1 || (value !== "clear" && value !== "hyper" && value !== "gt")) {
    sendErrorMessage(room, MESSAGES.CATEGORY_USAGE(), byPlayer.id);
    return;
  }

  const player = playerList[byPlayer.id];
  if (!player) return;

  player.category = value === "clear" ? null : value;
  handleAvatar(Situacions.Category, byPlayer, room);
  sendSuccessMessage(
    room,
    value === "clear" ? MESSAGES.CATEGORY_CLEARED() : MESSAGES.CATEGORY_DEFINED(value),
    byPlayer.id,
  );
}
