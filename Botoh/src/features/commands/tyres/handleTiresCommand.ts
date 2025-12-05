import { gameMode, GameMode } from "../../changeGameState/changeGameModes";
import { gameState } from "../../changeGameState/gameState";
import { Teams } from "../../changeGameState/teams";

import { sendErrorMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";

import { handlePitStop } from "../../tires&pits/handlePitStop";
import { ifInBoxZone } from "../../tires&pits/pitLane";
import { Tires } from "../../tires&pits/tires";

export function handleTiresCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
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

    //Code system for box
    // if (LEAGUE_MODE && room.getScores().time > 0) {
    //   const boxAlertReversed = playerList[byPlayer.id].boxAlert
    //     .toString()
    //     .split("")
    //     .reverse()
    //     .join("");

    //   if (
    //     (args[1] !== boxAlertReversed || args.length !== 2) &&
    //     !playerBuffList.some((player) => player.name === byPlayer.name)
    //   ) {
    //     sendErrorMessage(room, MESSAGES.CODE_WRONG(), byPlayer.id);
    //     return;
    //   }
    // }
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
    handlePitStop(room, byPlayer, tiresKey);
  }
}
