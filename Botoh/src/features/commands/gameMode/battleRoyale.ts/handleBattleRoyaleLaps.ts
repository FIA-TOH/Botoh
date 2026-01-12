import { Teams } from "../../../changeGameState/teams";
import { playerList } from "../../../changePlayerState/playerList";
import { getPlayerAndDiscs } from "../../../playerFeatures/getPlayerAndDiscs";
import { getRunningPlayers, timerController } from "../../../utils";

const END_DELAY = 30;

const battleRoyaleLapState = {
  lap: 0,
  finishedIds: new Set<number>(),
  initialPlayers: 0,
};

export function initBattleRoyale(room: RoomObject) {
  const initial = getRunningPlayers(getPlayerAndDiscs(room)).length;

  battleRoyaleLapState.lap = 0;
  battleRoyaleLapState.finishedIds.clear();
  battleRoyaleLapState.initialPlayers = initial;
}

export function handleBattleRoyaleLap(p: PlayerObject, room: RoomObject) {
  const playersAndDiscs = getPlayerAndDiscs(room);
  const runningPlayers = getRunningPlayers(playersAndDiscs);
  const playerData = playerList[p.id];

  if (playerData.currentLap < 2) {
    return;
  }

  if (battleRoyaleLapState.lap !== playerData.currentLap) {
    battleRoyaleLapState.lap = playerData.currentLap;
    battleRoyaleLapState.finishedIds.clear();
  }
  battleRoyaleLapState.finishedIds.add(p.id);

  if (battleRoyaleLapState.finishedIds.size < runningPlayers.length) {
    return;
  }

  room.setPlayerTeam(p.id, Teams.SPECTATORS);

  const remaining = runningPlayers.length - 1;

  room.sendAnnouncement(`${p.name} eliminated, ${remaining} remaining.`);

  if (remaining === 1) {
    const winner = runningPlayers.find((rp) => rp.p.id !== p.id)!.p;

    const eliminated = battleRoyaleLapState.initialPlayers - 1;

    room.sendAnnouncement(`${winner.name} won!, ${eliminated} eliminated.`);
    timerController.positionTimer = setTimeout(() => {
      getRunningPlayers(getPlayerAndDiscs(room)).forEach((rp) =>
        room.setPlayerTeam(rp.p.id, Teams.SPECTATORS),
      );

      timerController.positionTimer = null;
    }, END_DELAY * 1000);
  }
}
