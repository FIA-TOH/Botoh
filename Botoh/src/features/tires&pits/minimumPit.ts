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
  room: RoomObject,
) {
  const requiredPits = minimumPitStops;
  const lapsLeftAfterThis = totalLaps - currentLap;

  const effectivePitStops = pitStops;
  const missingPits = requiredPits - effectivePitStops;


  if (missingPits <= 0) {
    console.log("✔ Minimum met. Clearing timer.");
    clearPitWarningTimer(player.id);
    return;
  }

  if (lapsLeftAfterThis < missingPits) {
    console.log("❌ DSQ immediately. Not enough laps left.");
    clearPitWarningTimer(player.id);
    room.setPlayerTeam(player.id, Teams.SPECTATORS);
    sendAlertMessage(room, MESSAGES.DSQ_MINIMUM_PITS(), player.id);
    return;
  }

  if (lapsLeftAfterThis === missingPits) {
    if (pitWarningTimers[player.id]) {
      console.log("⚠ Timer already exists. Skipping new timer.");
      return;
    }

    console.log("⏳ Creating pit warning timer...");

    pitWarningTimers[player.id] = setTimeout(() => {
      console.log("⏰ TIMER EXECUTED for player", player.id);

      delete pitWarningTimers[player.id];

      const scores = room.getScores();
      if (!scores || scores.time <= 1) {
        console.log("⛔ Race not active anymore.");
        return;
      }

      const currentState = playerList[player.id];

      const latestPitStops = currentState?.pits?.pitsNumber ?? pitStops;
      const latestEffective = latestPitStops;
      const latestMissing = requiredPits - latestEffective;
      const latestCurrentLap = currentState?.currentLap ?? currentLap;
      const latestLapsLeftAfterThis = totalLaps - latestCurrentLap;

      console.log("----- TIMER STATE CHECK -----");
      console.log("LatestPitStops:", latestPitStops);
      console.log("LatestEffective:", latestEffective);
      console.log("LatestMissing:", latestMissing);
      console.log("LatestCurrentLap:", latestCurrentLap);
      console.log("LatestLapsLeftAfterThis:", latestLapsLeftAfterThis);

      if (latestMissing <= 0) {
        console.log("✔ Minimum met during timer window.");
        return;
      }

      if (latestLapsLeftAfterThis < latestMissing) {
        console.log("❌ DSQ inside timer. Not enough laps left.");
        room.setPlayerTeam(player.id, Teams.SPECTATORS);
        sendAlertMessage(room, MESSAGES.DSQ_MINIMUM_PITS(), player.id);
        return;
      }

      if (latestLapsLeftAfterThis === latestMissing) {
        console.log("⚠ Sending NEED PIT THIS LAP warning.");
        handleAvatar(Situacions.NeedPit, player, room);
        sendAlertMessage(room, MESSAGES.NEED_PIT_THIS_LAP(), player.id);
      }
    }, 3000);
  }
}
