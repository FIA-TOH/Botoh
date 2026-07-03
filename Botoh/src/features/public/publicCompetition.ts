import { getBestTime } from "../../circuits/bestTimes";
import { sendCyanMessage } from "../chat/chat";
import { GeneralGameMode } from "../changeGameState/changeGameModes";
import { getPlayersOrderedByQualiTime } from "../commands/gameMode/qualy/playerTime";
import { positionList } from "../commands/gameMode/race/positionList";
import { ACTUAL_CIRCUIT } from "../roomFeatures/stadiumChange";
import { isPublicBackendOnline } from "./publicServiceStatus";
import {
  getPublicAuthByPlayerId,
  isPublicUserLoggedIn,
  updatePublicSessionRank,
} from "./publicAuth";
import { PUBLIC_MESSAGES } from "./publicMessages";
import { getPublicCircuit } from "./publicCircuitRepository";
import { recordPublicCircuitRaceForPlayer } from "./publicCircuits";
import {
  ensurePublicCompetitionProfile,
  getPublicChampionshipStandings,
  getPublicCompetitionProfiles,
  PublicCompetitionProfile,
  recordPublicChampionshipPoints,
  recordPublicPlacementPerformance,
  recordPublicRankingXp,
} from "./publicCompetitionRepository";
import {
  getPublicRankName,
  getPublicRankEmoji,
  getRankTierByXp,
  PUBLIC_ROOKIE_RACES,
} from "./publicCompetitionRules";

const settledQualyKeys = new Set<string>();
const settledRaceKeys = new Set<string>();

type PublicCompetitionNotification = {
  playerId: number;
  message: ReturnType<(typeof PUBLIC_MESSAGES)[keyof typeof PUBLIC_MESSAGES]>;
};

function sendPublicCompetitionNotifications(
  room: RoomObject,
  notifications: PublicCompetitionNotification[],
) {
  notifications.forEach((notification) => {
    sendCyanMessage(room, notification.message, notification.playerId);
  });
}

async function getValidTrackRecord() {
  if (isPublicBackendOnline()) {
    const publicCircuit = await getPublicCircuit(ACTUAL_CIRCUIT.info.name);
    const publicRecord = publicCircuit?.record_lap_time ?? publicCircuit?.base_record_time;
    if (publicRecord && Number.isFinite(publicRecord) && publicRecord > 0 && publicRecord < 999) {
      return publicRecord;
    }
  }

  const bestTime = getBestTime(ACTUAL_CIRCUIT.info.name);
  const record = Number(bestTime?.[0]);
  return Number.isFinite(record) && record > 0 && record < 999 ? record : null;
}

function calculateRankingXp(profile: PublicCompetitionProfile, lapTime: number, record: number) {
  const rank = getRankTierByXp(profile.ranking_xp);
  const ratio = lapTime / record;
  const xpTable: Record<string, number[]> = {
    Kart: [100, 75, 60, 25, 15, 5],
    "Formula 4": [75, 40, 15, 5, -10, -40],
    "Formula 3": [90, 60, 30, 15, 5, -10],
    "Formula 2": [65, 25, 5, -5, -40, -80],
    "Formula 1": [50, 10, 0, -30, -80, -100],
  };
  const thresholds = [1, 1.005, 1.01, 1.02, 1.035, 1.05];
  const rankXp = xpTable[rank.name] ?? xpTable.Kart;

  if (ratio <= thresholds[0]) return rankXp[0];

  for (let index = 1; index < thresholds.length; index++) {
    if (ratio > thresholds[index]) continue;

    const previousThreshold = thresholds[index - 1];
    const nextThreshold = thresholds[index];
    const previousXp = rankXp[index - 1];
    const nextXp = rankXp[index];
    const progress = (ratio - previousThreshold) / (nextThreshold - previousThreshold);

    return Math.round(previousXp + (nextXp - previousXp) * progress);
  }

  return rankXp[rankXp.length - 1];
}

function calculatePerformancePercent(lapTime: number, record: number) {
  return Math.max(0, ((lapTime / record) - 1) * 100);
}

function calculateChampionshipPoints(input: {
  position: number;
  playersCount: number;
  profile: PublicCompetitionProfile;
  averageRankingXp: number;
}) {
  const fieldBonus = Math.sqrt(Math.max(1, input.playersCount));
  const performance = (input.playersCount - input.position + 1) / input.playersCount;
  const base = performance * 28 * fieldBonus;
  const rankDifficulty = Math.max(0.45, Math.min(1.8, input.averageRankingXp / Math.max(250, input.profile.ranking_xp)));
  const podiumBonus = input.position === 1 ? 8 : input.position === 2 ? 4 : input.position === 3 ? 2 : 0;
  const rawPoints = base * rankDifficulty + podiumBonus - (1 - performance) * 4;

  return Math.max(0, Math.round(rawPoints));
}

function getSettlementKey(kind: GeneralGameMode, signature: string) {
  return `${kind}:${ACTUAL_CIRCUIT.info.name}:${signature}`;
}

async function getLoggedProfilesByPlayerId(room: RoomObject) {
  const players = room.getPlayerList();
  const authById = new Map<number, string>();

  players.forEach((player) => {
    if (!isPublicUserLoggedIn(player)) return;
    const auth = getPublicAuthByPlayerId(player.id);
    if (auth) authById.set(player.id, auth);
  });

  const profiles = await getPublicCompetitionProfiles([...authById.values()]);
  const profileByAuth = new Map(profiles.map((profile) => [profile.auth, profile]));
  const profileByPlayerId = new Map<number, PublicCompetitionProfile>();

  authById.forEach((auth, playerId) => {
    const profile = profileByAuth.get(auth);
    if (profile) profileByPlayerId.set(playerId, profile);
  });

  return profileByPlayerId;
}

export async function settlePublicQualyRanking(
  room: RoomObject,
  options: { deferMessages?: boolean } = {},
) {
  const notifications: PublicCompetitionNotification[] = [];
  if (!isPublicBackendOnline()) return notifications;

  const record = await getValidTrackRecord();
  if (!record) return notifications;

  try {
    const profileByPlayerId = await getLoggedProfilesByPlayerId(room);
    const times = getPlayersOrderedByQualiTime().filter((time) => time.time < Number.MAX_VALUE);
    const key = getSettlementKey(
      GeneralGameMode.GENERAL_QUALY,
      times.map((time) => `${time.id}:${time.time}`).join("|"),
    );
    if (settledQualyKeys.has(key)) return notifications;
    settledQualyKeys.add(key);

    for (const time of times) {
      const profile = profileByPlayerId.get(time.id);
      if (!profile) continue;

      const previousRank = getPublicRankName(profile.ranking_xp, profile.placement_races_remaining);
      const performancePercent = calculatePerformancePercent(time.time, record);

      if (profile.placement_races_remaining > 0) {
        const updatedProfile = await recordPublicPlacementPerformance({
          auth: profile.auth,
          playerName: time.name,
          trackName: ACTUAL_CIRCUIT.info.name,
          lapTime: time.time,
          trackRecord: record,
          performancePercent,
        });

        notifications.push({
          playerId: time.id,
          message: PUBLIC_MESSAGES.RANKING_PLACEMENT_PERFORMANCE(
            performancePercent,
            updatedProfile.placement_performance_count,
            updatedProfile.placement_races_remaining,
          ),
        });
        continue;
      }

      const xpDelta = calculateRankingXp(profile, time.time, record);
      const updatedProfile = await recordPublicRankingXp({
        auth: profile.auth,
        playerName: time.name,
        trackName: ACTUAL_CIRCUIT.info.name,
        lapTime: time.time,
        trackRecord: record,
        xpDelta,
      });

      notifications.push({
        playerId: time.id,
        message: PUBLIC_MESSAGES.RANKING_XP_RESULT(
          xpDelta,
          updatedProfile.ranking_xp,
          getPublicRankName(updatedProfile.ranking_xp, updatedProfile.placement_races_remaining),
        ),
      });

      const newRank = getPublicRankName(updatedProfile.ranking_xp, updatedProfile.placement_races_remaining);
      updatePublicSessionRank(time.id, newRank);
      room.setPlayerAvatar(time.id, getPublicRankEmoji(newRank));

      if (
        previousRank !== newRank &&
        previousRank !== "Rookie" &&
        newRank !== "Rookie"
      ) {
        if (updatedProfile.ranking_xp > profile.ranking_xp) {
          notifications.push({
            playerId: time.id,
            message: PUBLIC_MESSAGES.RANKING_UP(previousRank, newRank),
          });
        } else {
          notifications.push({
            playerId: time.id,
            message: PUBLIC_MESSAGES.RANKING_DOWN(previousRank, newRank),
          });
        }
      }
    }
  } catch (error) {
    console.error("[publicCompetition] failed to settle public qualy ranking:", error);
  }

  if (!options.deferMessages) {
    sendPublicCompetitionNotifications(room, notifications);
  }

  return notifications;
}

export async function settlePublicRaceChampionship(
  room: RoomObject,
  options: { deferMessages?: boolean } = {},
) {
  const notifications: PublicCompetitionNotification[] = [];
  if (!isPublicBackendOnline()) return notifications;

  try {
    const profileByPlayerId = await getLoggedProfilesByPlayerId(room);
    const finishers = positionList.filter((position) => profileByPlayerId.has(position.id));
    if (finishers.length === 0) return notifications;
    const key = getSettlementKey(
      GeneralGameMode.GENERAL_RACE,
      finishers.map((finisher) => `${finisher.id}:${finisher.lap}:${finisher.totalTime}`).join("|"),
    );
    if (settledRaceKeys.has(key)) return notifications;
    settledRaceKeys.add(key);

    const averageRankingXp =
      finishers.reduce((sum, finisher) => sum + (profileByPlayerId.get(finisher.id)?.ranking_xp ?? 0), 0) /
      finishers.length;

    const raceResults: Array<{
      playerId: number;
      auth: string;
      pointsDelta: number;
      totalPoints: number;
    }> = [];

    for (let index = 0; index < finishers.length; index++) {
      const finisher = finishers[index];
      const profile = profileByPlayerId.get(finisher.id);
      if (!profile) continue;

      const pointsDelta = calculateChampionshipPoints({
        position: index + 1,
        playersCount: finishers.length,
        profile,
        averageRankingXp,
      });

      const updatedProfile = await recordPublicChampionshipPoints({
        auth: profile.auth,
        playerName: finisher.name,
        trackName: ACTUAL_CIRCUIT.info.name,
        position: index + 1,
        playersCount: finishers.length,
        averageRankingXp,
        pointsDelta,
      });

      const updatedRank = getPublicRankName(
        updatedProfile.ranking_xp,
        updatedProfile.placement_races_remaining,
      );
      updatePublicSessionRank(finisher.id, updatedRank);
      room.setPlayerAvatar(finisher.id, getPublicRankEmoji(updatedRank));

      if (
        profile.placement_races_remaining > 0 &&
        updatedProfile.placement_races_remaining === 0
      ) {
        raceResults.push({
          playerId: finisher.id,
          auth: profile.auth,
          pointsDelta,
          totalPoints: updatedProfile.championship_points,
        });
        notifications.push({
          playerId: finisher.id,
          message: PUBLIC_MESSAGES.RANKING_PLACEMENT_DEFINED(
            getPublicRankName(updatedProfile.ranking_xp, 0),
            updatedProfile.ranking_xp,
          ),
        });
        recordPublicCircuitRaceForPlayer(
          ACTUAL_CIRCUIT.info.name,
          finisher.id,
          finisher.name,
          index + 1,
        );
        continue;
      }

      raceResults.push({
        playerId: finisher.id,
        auth: profile.auth,
        pointsDelta,
        totalPoints: updatedProfile.championship_points,
      });

      recordPublicCircuitRaceForPlayer(
        ACTUAL_CIRCUIT.info.name,
        finisher.id,
        finisher.name,
        index + 1,
      );
    }

    const standings = await getPublicChampionshipStandings(
      raceResults.map((result) => result.auth),
    );
    const standingByAuth = new Map(standings.map((standing) => [standing.auth, standing]));

    raceResults.forEach((result) => {
      const standing = standingByAuth.get(result.auth);
      if (!standing) {
        notifications.push({
          playerId: result.playerId,
          message: PUBLIC_MESSAGES.CHAMPIONSHIP_POINTS_RESULT(
            result.pointsDelta,
            result.totalPoints,
          ),
        });
        return;
      }

      if (standing.position === 1) {
        notifications.push({
          playerId: result.playerId,
          message: PUBLIC_MESSAGES.CHAMPIONSHIP_STANDING_P1(
            result.pointsDelta,
            standing.championship_points,
            standing.position,
          ),
        });
        return;
      }

      notifications.push({
        playerId: result.playerId,
        message: PUBLIC_MESSAGES.CHAMPIONSHIP_STANDING_GAP(
          result.pointsDelta,
          standing.championship_points,
          standing.position,
          standing.points_behind_next ?? 0,
        ),
      });
    });
  } catch (error) {
    console.error("[publicCompetition] failed to settle public race championship:", error);
  }

  if (!options.deferMessages) {
    sendPublicCompetitionNotifications(room, notifications);
  }

  return notifications;
}

export function sendDeferredPublicCompetitionNotifications(
  room: RoomObject,
  notifications: PublicCompetitionNotification[],
) {
  sendPublicCompetitionNotifications(room, notifications);
}

export async function getOrCreatePublicCompetitionProfile(auth: string, name: string) {
  return ensurePublicCompetitionProfile(auth, name, PUBLIC_ROOKIE_RACES);
}
