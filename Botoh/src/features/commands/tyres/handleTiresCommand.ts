import { gameMode, GameMode } from "../../changeGameState/changeGameModes";
import { gameState } from "../../changeGameState/gameState";
import { Teams } from "../../changeGameState/teams";

import { sendErrorMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";

import { handlePitStop } from "../../tires&pits/handlePitStop";
import { ifInBoxZone } from "../../tires&pits/pitLane";
import { Tires, tyresActivated } from "../../tires&pits/tires";
import { isPitNewSystemEnabled, startNewPitSequence } from "../../tires&pits/newPitSystem/newPitManager";

export function handleTiresCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (!tyresActivated) {
    sendErrorMessage(room, MESSAGES.TYRES_DISABLED(), byPlayer.id);
    return;
  }

  if (
    room.getScores() &&
    gameState !== undefined &&
    gameState !== null &&
    byPlayer.team === Teams.RUNNERS
  ) {
    if (
      !ifInBoxZone(
        { p: byPlayer, disc: room.getPlayerDiscProperties(byPlayer.id) },
        room
      ) &&
      room.getScores().time > 0
    ) {
      sendErrorMessage(room, MESSAGES.NOT_IN_BOXES(), byPlayer.id);
      return;
    }
    if (args.length === 0) {
      sendErrorMessage(room, MESSAGES.INVALID_TIRES(), byPlayer.id);
      return;
    }

    const tiresStr = args[0].toUpperCase();
    if (
      gameMode !== GameMode.TRAINING &&
      (tiresStr === "TRAIN" || tiresStr === "T")
    ) {
      sendErrorMessage(room, MESSAGES.INVALID_TIRES(), byPlayer.id);
      return;
    }

    const tiresKey = Object.keys(Tires).find(
      (key) => key === tiresStr || key[0] === tiresStr
    ) as Tires | undefined;

    if (!tiresKey) {
      sendErrorMessage(room, MESSAGES.INVALID_TIRES(), byPlayer.id);
      return;
    }

    if (isPitNewSystemEnabled()) {
      if (room.getScores().time <= 0) {
        handlePitStop(room, byPlayer, tiresKey);
      } else {
        startNewPitSequence(byPlayer.id, room, tiresKey);
      }
    } else {
      handlePitStop(room, byPlayer, tiresKey);
    }
  }
}
