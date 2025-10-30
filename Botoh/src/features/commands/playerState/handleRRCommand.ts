import {
  gameMode,
  GameMode,
  generalGameMode,
  GeneralGameMode,
} from "../../changeGameState/changeGameModes";
import { ghostMode } from "../../changePlayerState/ghost";
import { playerList } from "../../changePlayerState/playerList";
import { resetPlayer } from "../../changePlayerState/players";
import { updatePlayerCollision } from "../../changePlayerState/updatePlayerCollision";
import { sendErrorMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { getPlayerAndDiscs } from "../../playerFeatures/getPlayerAndDiscs";
import { getRunningPlayers } from "../../utils";
import { CIRCUITS, currentMapIndex } from "../../zones/maps";
import { rrEnabled } from "../adminThings/handleRREnabledCommand";
import { RR_POSITION } from "../adminThings/handleRRPositionCommand";

export function handleRRAllCommand(room: RoomObject) {
  const playersAndDiscs = getPlayerAndDiscs(room);
  const runningPlayers = getRunningPlayers(playersAndDiscs);

  runningPlayers.forEach((player) => {
    if (
      room.getScores() === null ||
      !CIRCUITS[currentMapIndex].info.lastPlace
    ) {
      sendErrorMessage(room, MESSAGES.NOT_STARTED());
      return;
    }

    const pad = getPlayerAndDiscs(room).filter((p) => p.p.id === player.p.id);
    resetPlayer(player.p, room, player.p.id);

    if (
      generalGameMode === GeneralGameMode.GENERAL_QUALY ||
      gameMode === GameMode.TRAINING
    ) {
      playerList[player.p.id].kers = 100;
      playerList[player.p.id].wear = 20;
    }

    if (ghostMode) {
      updatePlayerCollision(room, pad, room.CollisionFlags.c0);
    } else {
      updatePlayerCollision(room, pad, room.CollisionFlags.red);
    }

    const position = RR_POSITION ?? CIRCUITS[currentMapIndex].info.lastPlace;

    room.setPlayerDiscProperties(player.p.id, {
      radius: 15,
      xspeed: 0,
      yspeed: 0,
      xgravity: 0,
      ygravity: 0,
      x: position.x,
      y: position.y,
    });
  });
}

export function handleRRCommand(
  byPlayer: PlayerObject,
  _: string[],
  room: RoomObject
) {
  if (!rrEnabled) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }
  if (room.getScores() === null || !CIRCUITS[currentMapIndex].info.lastPlace) {
    sendErrorMessage(room, MESSAGES.NOT_STARTED());
    return;
  }

  const playersAndDiscs = getPlayerAndDiscs(room);
  const pad = playersAndDiscs.filter((p) => p.p.id === byPlayer.id);

  resetPlayer(byPlayer, room, byPlayer.id);

  if (
    generalGameMode === GeneralGameMode.GENERAL_QUALY ||
    gameMode === GameMode.TRAINING
  ) {
    playerList[byPlayer.id].kers = 100;
    playerList[byPlayer.id].wear = 20;
  }

  if (ghostMode) {
    updatePlayerCollision(room, pad, room.CollisionFlags.c0);
  } else {
    updatePlayerCollision(room, pad, room.CollisionFlags.red);
  }

  const position = RR_POSITION ?? CIRCUITS[currentMapIndex].info.lastPlace;

  room.setPlayerDiscProperties(byPlayer.id, {
    radius: 15,
    xspeed: 0,
    yspeed: 0,
    xgravity: 0,
    ygravity: 0,
    x: position.x,
    y: position.y,
  });
}
