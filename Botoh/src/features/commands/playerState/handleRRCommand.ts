import {
  gameMode,
  GameMode,
  generalGameMode,
  GeneralGameMode,
} from "../../changeGameState/changeGameModes";
import { applyPlayerCollision } from "../../changePlayerState/playerCollision";
import { playerList } from "../../changePlayerState/playerList";
import { resetPlayer } from "../../changePlayerState/players";
import { sendErrorMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { getPlayerAndDiscs } from "../../playerFeatures/getPlayerAndDiscs";
import { constants } from "../../speed/constants";
import { getRunningPlayers } from "../../utils";
import { CIRCUITS, currentMapIndex } from "../../zones/maps";
import { rrEnabled } from "../adminThings/handleRREnabledCommand";
import { RR_POSITION } from "../adminThings/handleRRPositionCommand";
import { resetPitState } from "../../tires&pits/newPitSystem/newPitManager";

export function moveToRRPosition(player: PlayerObject, room: RoomObject) {
  const rrPosition = RR_POSITION ?? CIRCUITS[currentMapIndex].info.lastPlace;
  if (rrPosition) {
    room.setPlayerDiscProperties(player.id, {
      radius: constants.DEFAULT_PLAYER_RADIUS,
      xspeed: 0,
      yspeed: 0,
      xgravity: 0,
      ygravity: 0,
      x: rrPosition.x,
      y: rrPosition.y,
    });
  }
}

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

    resetPlayer(player.p, room, player.p.id);
    resetPitState(player.p.id);

    if (
      generalGameMode === GeneralGameMode.GENERAL_QUALY ||
      gameMode === GameMode.TRAINING
    ) {
      playerList[player.p.id].kers = 100;
      playerList[player.p.id].wear = 20;
    }

    applyPlayerCollision(room, player.p.id);

    const position = RR_POSITION ?? CIRCUITS[currentMapIndex].info.lastPlace;

    room.setPlayerDiscProperties(player.p.id, {
      radius: constants.DEFAULT_PLAYER_RADIUS,
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

  resetPlayer(byPlayer, room, byPlayer.id);
  resetPitState(byPlayer.id);

  if (
    generalGameMode === GeneralGameMode.GENERAL_QUALY ||
    gameMode === GameMode.TRAINING
  ) {
    playerList[byPlayer.id].kers = 100;
    playerList[byPlayer.id].wear = 20;
  }

  applyPlayerCollision(room, byPlayer.id);

  const position = RR_POSITION ?? CIRCUITS[currentMapIndex].info.lastPlace;

  room.setPlayerDiscProperties(byPlayer.id, {
    radius: constants.DEFAULT_PLAYER_RADIUS,
    xspeed: 0,
    yspeed: 0,
    xgravity: 0,
    ygravity: 0,
    x: position.x,
    y: position.y,
  });
}
