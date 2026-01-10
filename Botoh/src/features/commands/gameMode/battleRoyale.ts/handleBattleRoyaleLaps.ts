import { Teams } from "../../../changeGameState/teams";
import { playerList } from "../../../changePlayerState/playerList";
import { getPlayerAndDiscs } from "../../../playerFeatures/getPlayerAndDiscs";
import { getRunningPlayers, timerController } from "../../../utils";

const END_DELAY = 30;

export function handleBattleRoyaleLap(p: PlayerObject, room: RoomObject) {
  const playersAndDiscs = getPlayerAndDiscs(room);
  const runningPlayers = getRunningPlayers(playersAndDiscs);

  if (runningPlayers.length <= 1) return;

  const sorted = [...runningPlayers].sort(
    (a, b) => playerList[b.p.id].currentLap - playerList[a.p.id].currentLap,
  );

  const lastPlayer = sorted[sorted.length - 1];

  if (lastPlayer.p.id === p.id) {
    room.setPlayerTeam(p.id, Teams.SPECTATORS);

    const remaining = sorted.length - 1;

    room.sendAnnouncement(`${p.name} eliminated, ${remaining} remaning.`);
    // sendAlertMessage(
    //   room,
    //   MESSAGES.BATTLE_ROYALE_ELIMINATED(p.name, remaining),
    // );

    // Sobrou só um → vitória
    if (remaining === 1) {
      const winner = sorted[0].p;

      room.sendAnnouncement(`${p.name} won!, ${sorted.length - 1} eliminated.`);
      //   sendAlertMessage(
      //     room,
      //     MESSAGES.BATTLE_ROYALE_WINNER(winner.name, sorted.length - 1),
      //   );

      timerController.positionTimer = setTimeout(() => {
        getRunningPlayers(playersAndDiscs).forEach((rp) =>
          room.setPlayerTeam(rp.p.id, Teams.SPECTATORS),
        );
        timerController.positionTimer = null;
      }, END_DELAY * 1000);
    }
  }
}
