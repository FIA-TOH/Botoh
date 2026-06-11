import { gameMode, GameMode } from "../../changeGameState/changeGameModes";
import { gameState } from "../../changeGameState/gameState";
import { Teams } from "../../changeGameState/teams";

import { sendErrorMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";

import { handlePitStop } from "../../tires&pits/handlePitStop";
import { ifInBoxZone } from "../../tires&pits/pitLane";
import { Tires, tyresActivated } from "../../tires&pits/tires";
import { isPitNewSystemEnabled, startNewPitSequence } from "../../tires&pits/newPitSystem/newPitManager";
import { isPlayerRepairing } from "../../damage/repairSystem";
import { getPreparedPitTire, playerList } from "../../changePlayerState/playerList";

export function handleTiresCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (!tyresActivated) {
    sendErrorMessage(room, MESSAGES.TYRES_DISABLED(), byPlayer.id);
    return;
  }

  if (isPlayerRepairing(byPlayer.id)) {
    sendErrorMessage(room, MESSAGES.REPAIR_TYRES_BLOCKED(), byPlayer.id);
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
    const playerInfo = playerList[byPlayer.id];
    let tiresKey: Tires | undefined = undefined;

    if (args.length === 0) {
      tiresKey = getPreparedPitTire(byPlayer.id) ?? undefined;

      if (!tiresKey) {
        sendErrorMessage(room, MESSAGES.NO_PREPARED_PIT_TYRE(), byPlayer.id);
        return;
      }
    } else {
      const tiresStr = args[0].toUpperCase();
      if (
        gameMode !== GameMode.TRAINING &&
        (tiresStr === "TRAIN" || tiresStr === "T")
      ) {
        sendErrorMessage(room, MESSAGES.INVALID_TIRES(), byPlayer.id);
        return;
      }

      tiresKey = Object.keys(Tires).find(
        (key) => key === tiresStr || key[0] === tiresStr
      ) as Tires | undefined;
    }

    if (!tiresKey) {
      sendErrorMessage(room, MESSAGES.INVALID_TIRES(), byPlayer.id);
      return;
    }

    if (gameMode !== GameMode.TRAINING && tiresKey === Tires.TRAIN) {
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
