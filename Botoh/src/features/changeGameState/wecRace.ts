export const DEFAULT_WEC_RACE_DURATION_SECONDS = 2400;
export let WEC_RACE_DURATION_SECONDS = DEFAULT_WEC_RACE_DURATION_SECONDS;

// Called by the admin command only while the native game is stopped.
// Session resets preserve this choice; process restarts restore the default.
export function setWECRaceDuration(seconds: number): boolean {
  if (!Number.isSafeInteger(seconds) || seconds <= 0) return false;
  WEC_RACE_DURATION_SECONDS = seconds;
  resetWECRace();
  return true;
}

export function getWECRemainingTime(continuousTime: number) {
  const totalSeconds = Math.max(0, Math.ceil(WEC_RACE_DURATION_SECONDS - Math.max(elapsed, continuousTime || 0)));
  return { minutes: Math.floor(totalSeconds / 60), seconds: totalSeconds % 60 };
}

let elapsed = 0;
let timeExpired = false;
let finalLapStarted = false;
let checkered = false;
const finishedPlayers = new Set<number>();

export function resetWECRace() {
  elapsed = 0;
  timeExpired = false;
  finalLapStarted = false;
  checkered = false;
  finishedPlayers.clear();
}

// This is the continuous bot clock, not the native stadium clock. Internal
// day/night starts bypass the normal lifecycle and never reset this state.
export function updateWECRaceTime(continuousTime: number): boolean {
  if (Number.isFinite(continuousTime)) elapsed = Math.max(elapsed, continuousTime);
  if (!timeExpired && elapsed >= WEC_RACE_DURATION_SECONDS) {
    timeExpired = true;
    return true;
  }
  return false;
}

export function getWECRaceState() {
  return { elapsed, timeExpired, finalLapStarted, checkered };
}

export function crossWECFinishLine(playerId: number, isLeader: boolean) {
  const result = { finalLapStarted: false, finish: false, isWinner: false };
  if (finishedPlayers.has(playerId)) return result;
  if (!checkered && isLeader && timeExpired) {
    if (!finalLapStarted) {
      finalLapStarted = true;
      result.finalLapStarted = true;
      return result;
    }
    checkered = true;
    result.isWinner = true;
  }
  if (checkered) {
    finishedPlayers.add(playerId);
    result.finish = true;
  }
  return result;
}
