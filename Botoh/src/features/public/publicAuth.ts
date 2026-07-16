import { sendAlertMessage, sendCyanMessage, sendErrorMessage, sendSuccessMessage } from "../chat/chat";
import { getPlayerLanguage } from "../chat/messages";
import { idToAuth } from "../changePlayerState/playerList";
import {
  GeneralGameMode,
  generalGameMode,
} from "../changeGameState/changeGameModes";
import { Teams } from "../changeGameState/teams";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { kickPlayer } from "../utils";
import {
  createPublicUser,
  findPublicUserByAuth,
  validatePublicUserLogin,
} from "./publicUserRepository";
import { PUBLIC_MESSAGES } from "./publicMessages";
import {
  isPublicBackendOnline,
  onPublicBackendStatusChange,
  setPublicBackendOnline,
} from "./publicServiceStatus";
import {
  getNextPublicRank,
  getPublicRankEmoji,
  getPublicRankLabel,
  getPublicRankName,
  PublicDisplayedRankName,
} from "./publicCompetitionRules";
import {
  ensurePublicCompetitionProfile,
  getPublicChampionshipStandings,
} from "./publicCompetitionRepository";

const PUBLIC_AUTH_TIMEOUT_MS = 90000;
const PUBLIC_AUTH_WARNING_INTERVAL_MS = 30000;
const PUBLIC_AUTH_WELCOME_DELAY_MS = 2000;

interface PublicSession {
  auth: string;
  playerId: number;
  name: string;
  isLoggedIn: boolean;
  registeredThisSession: boolean;
  welcomeTimer: ReturnType<typeof setTimeout> | null;
  warningTimer: ReturnType<typeof setInterval> | null;
  kickTimer: ReturnType<typeof setTimeout> | null;
  joinedAt: number;
  rank: PublicDisplayedRankName | null;
}

const sessionsByAuth = new Map<string, PublicSession>();
const authByPlayerId = new Map<number, string>();

function hasPublicDatabaseConfig() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function arePublicAuthServicesOnline() {
  return isPublicBackendOnline() && hasPublicDatabaseConfig();
}

function isPublicRaceInProgress(room: RoomObject) {
  return (
    generalGameMode === GeneralGameMode.GENERAL_RACE &&
    (room.getScores()?.time ?? 0) > 0
  );
}

function getPublicAuth(player: PlayerObject): string | null {
  if (typeof player.auth === "string" && player.auth.trim()) {
    return player.auth;
  }

  const storedAuth = idToAuth[player.id] ?? authByPlayerId.get(player.id);
  if (typeof storedAuth === "string" && storedAuth.trim()) {
    return storedAuth;
  }

  return null;
}

function isDatabaseUnavailable(error: unknown) {
  const code = (error as { code?: string } | null)?.code;
  return [
    "DATABASE_UNAVAILABLE",
    "ECONNREFUSED",
    "ECONNRESET",
    "ENETUNREACH",
    "ENOTFOUND",
    "ETIMEDOUT",
    "3D000",
    "28P01",
    "57P01",
  ].includes(code ?? "");
}

function clearPublicAuthTimers(session: PublicSession) {
  if (session.welcomeTimer) {
    clearTimeout(session.welcomeTimer);
    session.welcomeTimer = null;
  }

  if (session.warningTimer) {
    clearInterval(session.warningTimer);
    session.warningTimer = null;
  }

  if (session.kickTimer) {
    clearTimeout(session.kickTimer);
    session.kickTimer = null;
  }
}

onPublicBackendStatusChange((isOnline) => {
  if (isOnline) return;

  sessionsByAuth.forEach((session) => {
    session.registeredThisSession = true;
    clearPublicAuthTimers(session);
  });
});

function markPublicAuthSatisfied(auth: string) {
  const session = sessionsByAuth.get(auth);
  if (!session) return;

  session.registeredThisSession = true;
  clearPublicAuthTimers(session);
}

function getSessionByPlayer(player: PlayerObject) {
  const auth = getPublicAuth(player);
  return auth ? sessionsByAuth.get(auth) ?? null : null;
}

export function isPublicUserLoggedIn(player: PlayerObject) {
  if (LEAGUE_MODE) return false;
  return getSessionByPlayer(player)?.isLoggedIn === true;
}

export function getPublicAuthByPlayerId(playerId: number) {
  return authByPlayerId.get(playerId) ?? idToAuth[playerId] ?? null;
}

export function getPublicLoggedPrefix(playerId: number) {
  const rank = getPublicRankByPlayerId(playerId);
  return `[${getPublicRankLabel(rank)}]`;
}

export function getPublicRankByPlayerId(playerId: number): PublicDisplayedRankName {
  const auth = getPublicAuthByPlayerId(playerId);
  if (!auth) return "Rookie";

  return sessionsByAuth.get(auth)?.rank ?? "Rookie";
}

export function getPublicRankAvatarByPlayerId(playerId: number) {
  return getPublicRankEmoji(getPublicRankByPlayerId(playerId));
}

export function updatePublicSessionRank(
  playerId: number,
  rank: PublicDisplayedRankName,
) {
  const auth = getPublicAuthByPlayerId(playerId);
  if (!auth) return;

  const session = sessionsByAuth.get(auth);
  if (session) {
    session.rank = rank;
  }
}

export function handlePublicPlayerJoin(room: RoomObject, player: PlayerObject) {
  const auth = getPublicAuth(player);
  if (LEAGUE_MODE) return;
  if (!arePublicAuthServicesOnline()) return;

  if (!auth) {
    console.warn("[publicAuth] player joined without auth:", {
      id: player.id,
      name: player.name,
      auth: player.auth,
      conn: player.conn,
    });
    return;
  }

  const session: PublicSession = {
    auth,
    playerId: player.id,
    name: player.name,
    isLoggedIn: false,
    registeredThisSession: false,
    welcomeTimer: null,
    warningTimer: null,
    kickTimer: null,
    joinedAt: Date.now(),
    rank: null,
  };

  const previousSession = sessionsByAuth.get(auth);
  if (previousSession) {
    clearPublicAuthTimers(previousSession);
  }

  sessionsByAuth.set(auth, session);
  authByPlayerId.set(player.id, auth);

  session.welcomeTimer = setTimeout(() => {
    if (session.isLoggedIn || session.registeredThisSession) return;
    sendAlertMessage(room, PUBLIC_MESSAGES.WELCOME_LOGIN_REQUIRED(), player.id);
  }, PUBLIC_AUTH_WELCOME_DELAY_MS);

  session.warningTimer = setInterval(() => {
    if (session.isLoggedIn || session.registeredThisSession) {
      clearPublicAuthTimers(session);
      return;
    }

    const elapsedMs = Date.now() - session.joinedAt;
    const remainingSeconds = Math.max(
      0,
      Math.ceil((PUBLIC_AUTH_TIMEOUT_MS - elapsedMs) / 1000),
    );

    if (remainingSeconds > 0) {
      sendAlertMessage(room, PUBLIC_MESSAGES.AUTH_WARNING(remainingSeconds), player.id);
    }
  }, PUBLIC_AUTH_WARNING_INTERVAL_MS);

  session.kickTimer = setTimeout(() => {
    if (session.isLoggedIn || session.registeredThisSession) return;

    const language = getPlayerLanguage(player.id);
    kickPlayer(player.id, PUBLIC_MESSAGES.AUTH_TIMEOUT_KICK()[language], room);
  }, PUBLIC_AUTH_TIMEOUT_MS);
}

export function handlePublicPlayerLeave(player: PlayerObject) {
  const auth = getPublicAuth(player);
  if (!auth) return;

  const session = sessionsByAuth.get(auth);
  if (session) {
    clearPublicAuthTimers(session);
  }

  sessionsByAuth.delete(auth);
  authByPlayerId.delete(player.id);
}

export async function handlePublicRegisterCommand(
  player: PlayerObject,
  args: string[],
  room: RoomObject,
) {
  if (LEAGUE_MODE) return false;

  if (!arePublicAuthServicesOnline()) {
    sendErrorMessage(room, PUBLIC_MESSAGES.SERVERS_OFFLINE(), player.id);
    return true;
  }

  const password = args[0];
  if (!password) {
    sendErrorMessage(room, PUBLIC_MESSAGES.PASSWORD_REQUIRED_REGISTER(), player.id);
    return true;
  }

  const auth = getPublicAuth(player);
  if (!auth) {
    console.warn("[publicAuth] register blocked because player auth is unavailable:", {
      id: player.id,
      name: player.name,
      auth: player.auth,
      storedAuth: idToAuth[player.id],
      conn: player.conn,
    });
    sendErrorMessage(room, PUBLIC_MESSAGES.AUTH_UNAVAILABLE(), player.id);
    return true;
  }

  try {
    const existingUser = await findPublicUserByAuth(auth);
    if (existingUser) {
      sendErrorMessage(room, PUBLIC_MESSAGES.ALREADY_REGISTERED(), player.id);
      return true;
    }

    await createPublicUser({
      auth,
      name: player.name,
      password,
    });
    await ensurePublicCompetitionProfile(auth, player.name);

    markPublicAuthSatisfied(auth);
    sendSuccessMessage(room, PUBLIC_MESSAGES.REGISTER_SUCCESS(), player.id);
    return true;
  } catch (error: any) {
    if (error?.code === "23505") {
      sendErrorMessage(room, PUBLIC_MESSAGES.ALREADY_REGISTERED(), player.id);
      return true;
    }

    if (isDatabaseUnavailable(error)) {
      console.error("[publicAuth] public database unavailable on register:", error);
      setPublicBackendOnline(false);
      sendErrorMessage(room, PUBLIC_MESSAGES.SERVERS_OFFLINE(), player.id);
      return true;
    }

    console.error("[publicAuth] register failed:", error);
    sendErrorMessage(room, PUBLIC_MESSAGES.SERVERS_OFFLINE(), player.id);
    return true;
  }
}

export async function handlePublicLoginCommand(
  player: PlayerObject,
  args: string[],
  room: RoomObject,
) {
  if (LEAGUE_MODE) return false;

  if (!arePublicAuthServicesOnline()) {
    sendErrorMessage(room, PUBLIC_MESSAGES.SERVERS_OFFLINE(), player.id);
    return true;
  }

  const password = args[0];
  if (!password) {
    sendErrorMessage(room, PUBLIC_MESSAGES.PASSWORD_REQUIRED_LOGIN(), player.id);
    return true;
  }

  const auth = getPublicAuth(player);
  if (!auth) {
    console.warn("[publicAuth] login blocked because player auth is unavailable:", {
      id: player.id,
      name: player.name,
      auth: player.auth,
      storedAuth: idToAuth[player.id],
      conn: player.conn,
    });
    sendErrorMessage(room, PUBLIC_MESSAGES.AUTH_UNAVAILABLE(), player.id);
    return true;
  }

  try {
    const result = await validatePublicUserLogin(auth, password, player.name);
    if (!result.success && result.code === "not_registered") {
      sendErrorMessage(room, PUBLIC_MESSAGES.NOT_REGISTERED(), player.id);
      return true;
    }

    if (!result.success && result.code === "incorrect_password") {
      sendErrorMessage(room, PUBLIC_MESSAGES.INCORRECT_PASSWORD(), player.id);
      return true;
    }

    const session = sessionsByAuth.get(auth);
    if (session) {
      session.isLoggedIn = true;
      session.registeredThisSession = true;
      clearPublicAuthTimers(session);
    } else {
      sessionsByAuth.set(auth, {
        auth,
        playerId: player.id,
        name: player.name,
        isLoggedIn: true,
        registeredThisSession: true,
        welcomeTimer: null,
        warningTimer: null,
        kickTimer: null,
        joinedAt: Date.now(),
        rank: null,
      });
    }

    room.setPlayerTeam(
      player.id,
      isPublicRaceInProgress(room) ? Teams.SPECTATORS : Teams.RUNNERS,
    );
    sendSuccessMessage(room, PUBLIC_MESSAGES.LOGIN_SUCCESS(), player.id);
    const profile = await ensurePublicCompetitionProfile(auth, player.name);
    const currentRank = getPublicRankName(
      profile.ranking_xp,
      profile.placement_races_remaining,
    );
    updatePublicSessionRank(player.id, currentRank);
    room.setPlayerAvatar(player.id, getPublicRankEmoji(currentRank));
    Promise.all([
      import("./publicCircuits"),
      import("../roomFeatures/stadiumChange"),
    ])
      .then(([{ hydratePublicDriverCircuitStats }, { ACTUAL_CIRCUIT }]) => {
        if (ACTUAL_CIRCUIT?.info?.name) {
          hydratePublicDriverCircuitStats(ACTUAL_CIRCUIT.info.name, player);
        }
      })
      .catch((error) => {
        console.error("[publicAuth] failed to hydrate public circuit stats:", error);
      });

    if (profile.placement_races_remaining > 0) {
      sendCyanMessage(
        room,
        PUBLIC_MESSAGES.RANKING_PLACEMENT_REMAINING(profile.placement_races_remaining),
        player.id,
      );
    } else {
      const nextRank = getNextPublicRank(profile.ranking_xp);
      sendCyanMessage(
        room,
        PUBLIC_MESSAGES.RANKING_STATUS(
          currentRank,
          profile.ranking_xp,
          nextRank ? Math.max(0, nextRank.minXp - profile.ranking_xp) : 0,
          nextRank?.name ?? currentRank,
        ),
        player.id,
      );
    }
    return true;
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      console.error("[publicAuth] public database unavailable on login:", error);
      setPublicBackendOnline(false);
      sendErrorMessage(room, PUBLIC_MESSAGES.SERVERS_OFFLINE(), player.id);
      return true;
    }

    console.error("[publicAuth] login failed:", error);
    sendErrorMessage(room, PUBLIC_MESSAGES.SERVERS_OFFLINE(), player.id);
    return true;
  }
}

export async function handlePublicStatsCommand(
  player: PlayerObject,
  room: RoomObject,
) {
  if (LEAGUE_MODE) return false;

  if (!arePublicAuthServicesOnline()) {
    sendErrorMessage(room, PUBLIC_MESSAGES.SERVERS_OFFLINE(), player.id);
    return true;
  }

  if (!isPublicUserLoggedIn(player)) {
    sendErrorMessage(room, PUBLIC_MESSAGES.PASSWORD_REQUIRED_LOGIN(), player.id);
    return true;
  }

  const auth = getPublicAuth(player);
  if (!auth) {
    console.warn("[publicAuth] stats blocked because player auth is unavailable:", {
      id: player.id,
      name: player.name,
      auth: player.auth,
      storedAuth: idToAuth[player.id],
      conn: player.conn,
    });
    sendErrorMessage(room, PUBLIC_MESSAGES.AUTH_UNAVAILABLE(), player.id);
    return true;
  }

  try {
    const profile = await ensurePublicCompetitionProfile(auth, player.name);
    const [standing] = await getPublicChampionshipStandings([auth]);
    const currentRank = getPublicRankName(
      profile.ranking_xp,
      profile.placement_races_remaining,
    );
    const nextRank = getNextPublicRank(profile.ranking_xp);
    const placementTargetRank =
      currentRank === "Rookie"
        ? getPublicRankName(profile.ranking_xp, 0)
        : null;

    sendCyanMessage(
      room,
      PUBLIC_MESSAGES.PUBLIC_STATS({
        name: profile.name,
        rank: getPublicRankLabel(currentRank),
        rankingXp: profile.ranking_xp,
        nextRank: placementTargetRank ?? nextRank?.name ?? currentRank,
        pointsToNextRank: placementTargetRank
          ? 0
          : nextRank
          ? Math.max(0, nextRank.minXp - profile.ranking_xp)
          : 0,
        placementRacesRemaining: profile.placement_races_remaining,
        championshipPosition: standing?.position ?? null,
        championshipPoints:
          standing?.championship_points ?? profile.championship_points,
        pointsBehindNext: standing?.points_behind_next ?? null,
        qualyCount: profile.qualy_count,
        racesCount: profile.races_count,
      }),
      player.id,
    );
    return true;
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      console.error("[publicAuth] public database unavailable on stats:", error);
      setPublicBackendOnline(false);
      sendErrorMessage(room, PUBLIC_MESSAGES.SERVERS_OFFLINE(), player.id);
      return true;
    }

    console.error("[publicAuth] stats failed:", error);
    sendErrorMessage(room, PUBLIC_MESSAGES.SERVERS_OFFLINE(), player.id);
    return true;
  }
}

export function sendPublicLoggedChat(
  room: RoomObject,
  player: PlayerObject,
  message: string,
) {
  const prefix = getPublicLoggedPrefix(player.id);
  room.sendAnnouncement(
    `${prefix} ${player.name}: ${message}`,
    undefined,
  );
}
