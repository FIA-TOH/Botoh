import {
  gameMode,
  GameMode,
  generalGameMode,
  GeneralGameMode,
} from "../../changeGameState/changeGameModes";
import { Teams } from "../../changeGameState/teams";
import { playerList } from "../../changePlayerState/playerList";
import { resetPlayer } from "../../changePlayerState/players";
import { sendAlertMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { log } from "../../discord/logger";

export function handleAfkCommand(
  byPlayer: PlayerObject,
  _: string[],
  room: RoomObject
) {
  const player = playerList[byPlayer.id];
  if (!player) {
    log(`Player not found to give AFK. ${byPlayer.name}`);
    return;
  }

  if (byPlayer.team === Teams.RUNNERS) {
    room.setPlayerTeam(byPlayer.id, Teams.SPECTATORS);
    player.afk = true;
    sendAlertMessage(room, MESSAGES.NOW_AFK(), byPlayer.id);
    resetPlayer(byPlayer, room, byPlayer.id);
  } else if (
    generalGameMode === GeneralGameMode.GENERAL_QUALY ||
    gameMode == GameMode.TRAINING ||
    gameMode === GameMode.WAITING
  ) {
    room.setPlayerTeam(byPlayer.id, Teams.RUNNERS);
    player.afk = false;
    resetPlayer(byPlayer, room, byPlayer.id);
  } else if (player.afk) {
    player.afk = false;
    sendAlertMessage(room, MESSAGES.REMOVED_FROM_AFK(), byPlayer.id);
  } else {
    player.afk = true;
    sendAlertMessage(room, MESSAGES.NOW_AFK(), byPlayer.id);
  }

  const allPlayers = room.getPlayerList();
  if (
    allPlayers.length > 0 &&
    allPlayers.every((p) => playerList[p.id]?.afk === true)
  ) {
    allPlayers.forEach((p) => {
      room.kickPlayer(p.id, "afk with no one on the room", false);
    });
  }
}
