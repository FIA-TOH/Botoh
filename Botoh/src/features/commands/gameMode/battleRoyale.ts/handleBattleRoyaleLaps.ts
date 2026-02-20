import { Teams } from "../../../changeGameState/teams";
import { playerList } from "../../../changePlayerState/playerList";
import {
  sendBlueMessage,
  sendGreenMessage,
  sendRedMessage,
  sendYellowMessage,
} from "../../../chat/chat";
import { MESSAGES } from "../../../chat/messages";
import { getPlayerAndDiscs } from "../../../playerFeatures/getPlayerAndDiscs";
import { getRunningPlayers, timerController } from "../../../utils";

const END_DELAY = 30;

export let battleRoyaleTwoLapsConfig = 0;

const battleRoyaleLapState = {
  lap: 0,

  finishedIds: new Set<number>(),

  playersAtLapStart: 0,

  initialPlayers: 0,

  twoLapsTotal: 0,
  twoLapsUsed: 0,
};

export function setBattleRoyaleTwoLaps(value: number) {
  battleRoyaleTwoLapsConfig = value;
}

export function initBattleRoyale(room: RoomObject) {
  const initial = getRunningPlayers(getPlayerAndDiscs(room)).length;

  battleRoyaleLapState.lap = 0;
  battleRoyaleLapState.finishedIds.clear();
  battleRoyaleLapState.playersAtLapStart = initial;
  battleRoyaleLapState.initialPlayers = initial;

  battleRoyaleLapState.twoLapsTotal = battleRoyaleTwoLapsConfig;
  battleRoyaleLapState.twoLapsUsed = 0;
}

function shouldEliminateThisLap(lap: number): boolean {
  if (lap < 2) return false;

  const lapIndex = lap - 1;
  const roundIndex = Math.floor((lapIndex - 1) / 2);

  if (roundIndex < battleRoyaleTwoLapsConfig) {
    return lapIndex % 2 === 0;
  }

  return true;
}

export function handleBattleRoyaleLap(p: PlayerObject, room: RoomObject) {
  const playersAndDiscs = getPlayerAndDiscs(room);
  const runningPlayers = getRunningPlayers(playersAndDiscs);
  const playerData = playerList[p.id];

  if (playerData.currentLap < 2) return;

  if (battleRoyaleLapState.lap !== playerData.currentLap) {
    battleRoyaleLapState.lap = playerData.currentLap;
    battleRoyaleLapState.finishedIds.clear();

    battleRoyaleLapState.playersAtLapStart = runningPlayers.length;
  }

  battleRoyaleLapState.finishedIds.add(p.id);

  if (
    battleRoyaleLapState.finishedIds.size <
    battleRoyaleLapState.playersAtLapStart
  ) {
    return;
  }

  if (!shouldEliminateThisLap(playerData.currentLap)) {
    sendBlueMessage(room, MESSAGES.TWO_LAPS(playerData.currentLap));
    return;
  }

  if (runningPlayers.length < battleRoyaleLapState.playersAtLapStart) {
    return;
  }

  room.setPlayerTeam(p.id, Teams.SPECTATORS);

  const remaining = runningPlayers.length - 1;

  sendRedMessage(room, MESSAGES.BR_ELIMINATED(p.name));
  sendYellowMessage(room, MESSAGES.BR_REMAINING(remaining));

  if (remaining === 1) {
    const winner = runningPlayers.find((rp) => rp.p.id !== p.id)!.p;
    const eliminated = battleRoyaleLapState.initialPlayers - 1;

    sendGreenMessage(room, MESSAGES.BR_WINNER(winner.name, eliminated));

    timerController.positionTimer = setTimeout(() => {
      getRunningPlayers(getPlayerAndDiscs(room)).forEach((rp) =>
        room.setPlayerTeam(rp.p.id, Teams.SPECTATORS),
      );
      timerController.positionTimer = null;
    }, END_DELAY * 1000);
  }
}
