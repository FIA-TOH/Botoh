import { getBestTime } from "../../circuits/bestTimes";
import { Circuit } from "../../circuits/Circuit";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { isPublicBackendOnline } from "./publicServiceStatus";
import { getPublicAuthByPlayerId, isPublicUserLoggedIn } from "./publicAuth";
import {
  getCachedPublicCircuit,
  getCachedPublicCircuitLapRecord,
  getPublicCircuit,
  getPublicDriverCircuitStats,
  incrementPublicCircuitVote,
  PublicDriverCircuitStats,
  recordPublicCircuitRaceResult,
  recordPublicLapAttempt,
  recordPublicSectorAttempt,
  upsertPublicCircuit,
} from "./publicCircuitRepository";
import { applyPublicCircuitRRPosition } from "./publicCircuitRR";

function isPublicCircuitEnabled() {
  return !LEAGUE_MODE && isPublicBackendOnline();
}

const driverCircuitStatsCache = new Map<string, PublicDriverCircuitStats>();

function getDriverCircuitStatsCacheKey(auth: string, trackName: string) {
  return `${auth}::${trackName}`;
}

function cacheDriverCircuitStats(stats: PublicDriverCircuitStats) {
  driverCircuitStatsCache.set(
    getDriverCircuitStatsCacheKey(stats.auth, stats.track_name),
    stats,
  );
  return stats;
}

function getCachedPublicDriverCircuitStats(auth: string, trackName: string) {
  return driverCircuitStatsCache.get(getDriverCircuitStatsCacheKey(auth, trackName)) ?? null;
}

function isValidTime(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 && value < 999;
}

function getBaseRecord(trackName: string) {
  const bestTime = getBestTime(trackName);
  const time = Number(bestTime?.[0]);
  return {
    time: isValidTime(time) ? time : null,
    driver: typeof bestTime?.[1] === "string" ? bestTime[1] : null,
  };
}

export function getPublicCircuitLapRecordForTrack(trackName: string) {
  if (!isPublicCircuitEnabled()) return null;
  return getCachedPublicCircuitLapRecord(trackName);
}

export function getPublicDriverBestLapForTrack(trackName: string, playerId: number) {
  if (!isPublicCircuitEnabled()) return null;
  const auth = getPublicAuthByPlayerId(playerId);
  if (!auth) return null;

  const stats = getCachedPublicDriverCircuitStats(auth, trackName);
  return isValidTime(stats?.best_lap_time) ? stats.best_lap_time : null;
}

export function getPublicCircuitSectorRecordForTrack(
  trackName: string,
  sectorIndex: 1 | 2 | 3,
) {
  if (!isPublicCircuitEnabled()) return null;
  const record = getCachedPublicCircuit(trackName);
  if (!record) return null;

  const value =
    sectorIndex === 1
      ? record.sector1_record_time
      : sectorIndex === 2
        ? record.sector2_record_time
        : record.sector3_record_time;

  return isValidTime(value) ? value : null;
}

export function getPublicDriverBestSectorForTrack(
  trackName: string,
  playerId: number,
  sectorIndex: 1 | 2 | 3,
) {
  if (!isPublicCircuitEnabled()) return null;
  const auth = getPublicAuthByPlayerId(playerId);
  if (!auth) return null;

  const stats = getCachedPublicDriverCircuitStats(auth, trackName);
  const value =
    sectorIndex === 1
      ? stats?.best_sector1_time
      : sectorIndex === 2
        ? stats?.best_sector2_time
        : stats?.best_sector3_time;

  return isValidTime(value) ? value : null;
}

export function hydratePublicDriverCircuitStats(
  trackName: string,
  player: PlayerObject,
) {
  if (!isPublicCircuitEnabled() || !trackName) return;
  if (!isPublicUserLoggedIn(player)) return;

  const auth = getPublicAuthByPlayerId(player.id);
  if (!auth) return;

  getPublicDriverCircuitStats(auth, trackName)
    .then((stats) => {
      if (stats) cacheDriverCircuitStats(stats);
    })
    .catch((error) => {
      console.error("[publicCircuits] failed to hydrate public driver circuit stats:", error);
    });
}

export function hydratePublicDriverCircuitStatsForRoom(
  trackName: string,
  room: RoomObject,
) {
  room.getPlayerList().forEach((player) => {
    hydratePublicDriverCircuitStats(trackName, player);
  });
}

export function syncPublicCircuitOnMapLoad(circuit: Circuit) {
  if (!isPublicCircuitEnabled() || !circuit.info?.name) return;

  const trackName = circuit.info.name;
  const baseRecord = getBaseRecord(trackName);

  upsertPublicCircuit({
    trackName,
    baseRecordTime: baseRecord.time,
    baseRecordDriver: baseRecord.driver,
    incrementPlayed: true,
  })
    .then(() => getPublicCircuit(trackName))
    .then(() => applyPublicCircuitRRPosition(circuit))
    .catch((error) => {
      console.error("[publicCircuits] failed to sync public circuit:", error);
    });
}

export function registerPublicCircuitVote(trackName: string) {
  if (!isPublicCircuitEnabled()) return;

  const baseRecord = getBaseRecord(trackName);
  upsertPublicCircuit({
    trackName,
    baseRecordTime: baseRecord.time,
    baseRecordDriver: baseRecord.driver,
  })
    .then(() => incrementPublicCircuitVote(trackName))
    .catch((error) => {
      console.error("[publicCircuits] failed to register public circuit vote:", error);
    });
}

export function recordPublicLapForPlayer(
  trackName: string,
  player: PlayerObject,
  lapTime: number,
  sectorTimes: [number | null, number | null, number | null],
) {
  if (!isPublicCircuitEnabled() || !trackName) return;
  if (!isPublicUserLoggedIn(player)) return;

  const auth = getPublicAuthByPlayerId(player.id);
  if (!auth) return;

  const cachedStats = getCachedPublicDriverCircuitStats(auth, trackName);
  if (cachedStats) {
    cachedStats.best_lap_time =
      cachedStats.best_lap_time === null
        ? lapTime
        : Math.min(cachedStats.best_lap_time, lapTime);
    cachedStats.best_sector1_time =
      sectorTimes[0] === null
        ? cachedStats.best_sector1_time
        : cachedStats.best_sector1_time === null
          ? sectorTimes[0]
          : Math.min(cachedStats.best_sector1_time, sectorTimes[0]);
    cachedStats.best_sector2_time =
      sectorTimes[1] === null
        ? cachedStats.best_sector2_time
        : cachedStats.best_sector2_time === null
          ? sectorTimes[1]
          : Math.min(cachedStats.best_sector2_time, sectorTimes[1]);
    cachedStats.best_sector3_time =
      sectorTimes[2] === null
        ? cachedStats.best_sector3_time
        : cachedStats.best_sector3_time === null
          ? sectorTimes[2]
          : Math.min(cachedStats.best_sector3_time, sectorTimes[2]);
  }

  recordPublicLapAttempt({
    auth,
    playerName: player.name,
    trackName,
    lapTime,
    sectorTimes,
  }).catch((error) => {
    console.error("[publicCircuits] failed to record public lap:", error);
  });
}

export function recordPublicSectorForPlayer(
  trackName: string,
  player: PlayerObject,
  sectorIndex: 1 | 2 | 3,
  sectorTime: number,
) {
  if (!isPublicCircuitEnabled() || !trackName) return;
  if (!isPublicUserLoggedIn(player)) return;

  const auth = getPublicAuthByPlayerId(player.id);
  if (!auth) return;

  const cachedStats = getCachedPublicDriverCircuitStats(auth, trackName);
  if (cachedStats) {
    const key = `best_sector${sectorIndex}_time` as const;
    cachedStats[key] =
      cachedStats[key] === null
        ? sectorTime
        : Math.min(cachedStats[key], sectorTime);
  }

  recordPublicSectorAttempt({
    auth,
    playerName: player.name,
    trackName,
    sectorIndex,
    sectorTime,
  }).catch((error) => {
    console.error("[publicCircuits] failed to record public sector:", error);
  });
}

export function recordPublicCircuitRaceForPlayer(
  trackName: string,
  playerId: number,
  playerName: string,
  position: number,
) {
  if (!isPublicCircuitEnabled() || !trackName) return;

  const auth = getPublicAuthByPlayerId(playerId);
  if (!auth) return;

  recordPublicCircuitRaceResult({
    auth,
    playerName,
    trackName,
    position,
  }).catch((error) => {
    console.error("[publicCircuits] failed to record public circuit race:", error);
  });
}
