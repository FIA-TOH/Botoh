import { Teams } from "../changeGameState/teams";
import { handleAvatar, Situacions } from "../changePlayerState/handleAvatar";
import { sendAlertMessage } from "../chat/chat";
import { MESSAGES } from "../chat/messages";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { playerList } from "../changePlayerState/playerList";

let minimumPitStops = LEAGUE_MODE ? 0 : 1;
const pitWarningTimers: Record<number, NodeJS.Timeout | undefined> = {};

export function defineMinimumPitStops(quantity: number) {
  minimumPitStops = quantity;
}

export function clearPitWarningTimer(playerId: number) {
  if (pitWarningTimers[playerId]) {
    clearTimeout(pitWarningTimers[playerId]!);
    delete pitWarningTimers[playerId];
  }
}

export function processIfMinimumPitStopsMet(
  player: PlayerObject,
  currentLap: number,
  totalLaps: number,
  pitStops: number,
  room: RoomObject
) {
  const requiredPits = minimumPitStops + 1;
  const lapsLeftAfterThis = totalLaps - currentLap;

  const effectivePitStops = Math.max(1, pitStops);
  const missingPits = requiredPits - effectivePitStops;

  if (missingPits <= 0) {
    clearPitWarningTimer(player.id);
    return;
  }
  if (lapsLeftAfterThis < missingPits) {
    clearPitWarningTimer(player.id);
    room.setPlayerTeam(player.id, Teams.SPECTATORS);
    sendAlertMessage(room, MESSAGES.DSQ_MINIMUM_PITS(), player.id);

    return;
  }

  if (lapsLeftAfterThis === missingPits) {
    if (pitWarningTimers[player.id]) {
      return;
    }

    pitWarningTimers[player.id] = setTimeout(() => {
      delete pitWarningTimers[player.id];

      const scores = room.getScores();
      if (!scores || scores.time <= 1) {
        return;
      }

      const currentState = playerList[player.id];
      const latestPitStops = currentState?.pits?.pitsNumber ?? pitStops;
      const latestEffective = Math.max(1, latestPitStops);
      const latestMissing = requiredPits - latestEffective;
      const latestCurrentLap = currentState?.currentLap ?? currentLap;
      const latestLapsLeftAfterThis = totalLaps - latestCurrentLap;

      if (latestMissing <= 0) {
        return;
      }

      if (latestLapsLeftAfterThis < latestMissing) {
        room.setPlayerTeam(player.id, Teams.SPECTATORS);
        sendAlertMessage(room, MESSAGES.DSQ_MINIMUM_PITS(), player.id);

        return;
      }

      if (latestLapsLeftAfterThis === latestMissing) {
        handleAvatar(Situacions.NeedPit, player, room);
        sendAlertMessage(room, MESSAGES.NEED_PIT_THIS_LAP(), player.id);
      }
    }, 3000);
  }
}
