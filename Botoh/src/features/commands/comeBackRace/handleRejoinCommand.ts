import {
  GeneralGameMode,
  generalGameMode,
} from "../../changeGameState/changeGameModes";
import { Teams } from "../../changeGameState/teams";
import { handleAvatar, Situacions } from "../../changePlayerState/handleAvatar";
import { playerList } from "../../changePlayerState/playerList";
import { sendErrorMessage, sendChatMessage } from "../../chat/chat";
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
    room.sendAnnouncement(
      `❌ Você não estava correndo antes de sair.`,
      byPlayer.id
    );
    return;
  }

  const info = playersLeftInfo[index];
  const leftAt = new Date(info.leftAt);
  const diffInSeconds = (now.getTime() - leftAt.getTime()) / 1000;

  if (diffInSeconds > REJOIN_TIME_LIMIT) {
    room.sendAnnouncement(`❌ O tempo para rejoin expirou.`, byPlayer.id);
    return;
  }

  room.setPlayerTeam(byPlayer.id, Teams.RUNNERS);

  setTimeout(() => {
    Object.assign(playerList[byPlayer.id], info);

    resetPlayerComeBack(byPlayer, room, byPlayer.id, info);

    handleAvatar(Situacions.ChangeTyre, byPlayer, room);
  }, 500);

  room.sendAnnouncement(
    `🏁 Você voltou para a corrida! Aguarde o primeiro colocado passar pela linha de chegada para sair do box — caso contrário, será desclassificado.`,
    byPlayer.id
  );
  room.sendAnnouncement(
    `📢 O aviso será mostrado no chat e no seu avatar quando for permitido sair.`,
    byPlayer.id
  );

  playersLeftInfo.splice(index, 1);
}
