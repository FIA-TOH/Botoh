import {
  GeneralGameMode,
  generalGameMode,
} from "../../changeGameState/changeGameModes";
import { Teams } from "../../changeGameState/teams";
import { handleAvatar, Situacions } from "../../changePlayerState/handleAvatar";
import { playerList } from "../../changePlayerState/playerList";
import {
  sendErrorMessage,
  sendChatMessage,
  sendAlertMessage,
} from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import {
  playersLeftInfo,
  REJOIN_TIME_LIMIT,
} from "../../comeBackRace.ts/comeBackToRaceFunctions";
import { resetPlayerComeBack } from "../../comeBackRace.ts/playerComeBack";
import { defineMinimumPitStops } from "../../tires&pits/minimumPit";
import { laps } from "../../zones/laps";

export function handleRejoinCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (
    room.getScores() === null ||
    generalGameMode !== GeneralGameMode.GENERAL_RACE
  ) {
    sendErrorMessage(room, MESSAGES.NOT_STARTED(), byPlayer.id);
    return false;
  }

  const playerName = byPlayer.name;
  const now = new Date();

  const index = playersLeftInfo.findIndex((p) => p.name === playerName);

  if (index === -1) {
    sendErrorMessage(room, MESSAGES.YOU_WERENT_RACING_BEFORE(), byPlayer.id);
    return;
  }

  const info = playersLeftInfo[index];
  const leftAt = new Date(info.leftAt);
  const diffInSeconds = (now.getTime() - leftAt.getTime()) / 1000;

  if (diffInSeconds > REJOIN_TIME_LIMIT) {
    sendErrorMessage(room, MESSAGES.THE_JOIN_TIME_IS_OVER(), byPlayer.id);
    return;
  }

  room.setPlayerTeam(byPlayer.id, Teams.RUNNERS);

  setTimeout(() => {
    Object.assign(playerList[byPlayer.id], info);

    resetPlayerComeBack(byPlayer, room, byPlayer.id, info);

    handleAvatar(Situacions.ChangeTyre, byPlayer, room);
  }, 500);

  sendAlertMessage(room, MESSAGES.CAME_BACK_RACE_ONE(), byPlayer.id);
  sendAlertMessage(room, MESSAGES.CAME_BACK_RACE_TWO(), byPlayer.id);

  playersLeftInfo.splice(index, 1);
}
