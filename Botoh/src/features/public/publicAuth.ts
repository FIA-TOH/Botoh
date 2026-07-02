import { COLORS, FONTS, sendAlertMessage, sendErrorMessage, sendSuccessMessage } from "../chat/chat";
import { getPlayerLanguage } from "../chat/messages";
import { Teams } from "../changeGameState/teams";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { kickPlayer } from "../utils";
import {
  createPublicUser,
  findPublicUserByAuth,
  validatePublicUserLogin,
} from "./publicUserRepository";
import { PUBLIC_MESSAGES } from "./publicMessages";

const PUBLIC_AUTH_TIMEOUT_MS = 90000;
const PUBLIC_AUTH_WARNING_INTERVAL_MS = 30000;

interface PublicSession {
  auth: string;
  playerId: number;
  name: string;
  isLoggedIn: boolean;
  registeredThisSession: boolean;
  warningTimer: ReturnType<typeof setInterval> | null;
  kickTimer: ReturnType<typeof setTimeout> | null;
  joinedAt: number;
}

const sessionsByAuth = new Map<string, PublicSession>();
const authByPlayerId = new Map<number, string>();

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
  if (session.warningTimer) {
    clearInterval(session.warningTimer);
    session.warningTimer = null;
  }

  if (session.kickTimer) {
    clearTimeout(session.kickTimer);
    session.kickTimer = null;
  }
}

function markPublicAuthSatisfied(auth: string) {
  const session = sessionsByAuth.get(auth);
  if (!session) return;

  session.registeredThisSession = true;
  clearPublicAuthTimers(session);
}

function getSessionByPlayer(player: PlayerObject) {
  const auth = player.auth ?? authByPlayerId.get(player.id);
  return auth ? sessionsByAuth.get(auth) ?? null : null;
}

export function isPublicUserLoggedIn(player: PlayerObject) {
  if (LEAGUE_MODE) return false;
  return getSessionByPlayer(player)?.isLoggedIn === true;
}

export function getPublicLoggedPrefix(playerId: number) {
  const language = getPlayerLanguage(playerId);
  return PUBLIC_MESSAGES.LOGGED_PREFIX()[language];
}

export function handlePublicPlayerJoin(room: RoomObject, player: PlayerObject) {
  if (LEAGUE_MODE || !player.auth) return;

  const session: PublicSession = {
    auth: player.auth,
    playerId: player.id,
    name: player.name,
    isLoggedIn: false,
    registeredThisSession: false,
    warningTimer: null,
    kickTimer: null,
    joinedAt: Date.now(),
  };

  const previousSession = sessionsByAuth.get(player.auth);
  if (previousSession) {
    clearPublicAuthTimers(previousSession);
  }

  sessionsByAuth.set(player.auth, session);
  authByPlayerId.set(player.id, player.auth);

  room.setPlayerTeam(player.id, Teams.SPECTATORS);
  sendAlertMessage(room, PUBLIC_MESSAGES.WELCOME_LOGIN_REQUIRED(), player.id);

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
  if (!player.auth) return;

  const session = sessionsByAuth.get(player.auth);
  if (session) {
    clearPublicAuthTimers(session);
  }

  sessionsByAuth.delete(player.auth);
  authByPlayerId.delete(player.id);
}

export async function handlePublicRegisterCommand(
  player: PlayerObject,
  args: string[],
  room: RoomObject,
) {
  if (LEAGUE_MODE) return false;

  const password = args[0];
  if (!password) {
    sendErrorMessage(room, PUBLIC_MESSAGES.PASSWORD_REQUIRED_REGISTER(), player.id);
    return true;
  }

  if (!player.auth) {
    sendErrorMessage(room, PUBLIC_MESSAGES.DATABASE_UNAVAILABLE(), player.id);
    return true;
  }

  try {
    const existingUser = await findPublicUserByAuth(player.auth);
    if (existingUser) {
      sendErrorMessage(room, PUBLIC_MESSAGES.ALREADY_REGISTERED(), player.id);
      return true;
    }

    await createPublicUser({
      auth: player.auth,
      name: player.name,
      password,
    });

    markPublicAuthSatisfied(player.auth);
    room.setPlayerTeam(player.id, Teams.SPECTATORS);
    sendSuccessMessage(room, PUBLIC_MESSAGES.REGISTER_SUCCESS(), player.id);
    return true;
  } catch (error: any) {
    if (error?.code === "23505") {
      sendErrorMessage(room, PUBLIC_MESSAGES.ALREADY_REGISTERED(), player.id);
      return true;
    }

    if (isDatabaseUnavailable(error)) {
      sendErrorMessage(room, PUBLIC_MESSAGES.DATABASE_UNAVAILABLE(), player.id);
      return true;
    }

    console.error("[publicAuth] register failed:", error);
    sendErrorMessage(room, PUBLIC_MESSAGES.DATABASE_UNAVAILABLE(), player.id);
    return true;
  }
}

export async function handlePublicLoginCommand(
  player: PlayerObject,
  args: string[],
  room: RoomObject,
) {
  if (LEAGUE_MODE) return false;

  const password = args[0];
  if (!password) {
    sendErrorMessage(room, PUBLIC_MESSAGES.PASSWORD_REQUIRED_LOGIN(), player.id);
    return true;
  }

  if (!player.auth) {
    sendErrorMessage(room, PUBLIC_MESSAGES.DATABASE_UNAVAILABLE(), player.id);
    return true;
  }

  try {
    const result = await validatePublicUserLogin(player.auth, password, player.name);
    if (!result.success && result.code === "not_registered") {
      sendErrorMessage(room, PUBLIC_MESSAGES.NOT_REGISTERED(), player.id);
      return true;
    }

    if (!result.success && result.code === "incorrect_password") {
      sendErrorMessage(room, PUBLIC_MESSAGES.INCORRECT_PASSWORD(), player.id);
      return true;
    }

    const session = sessionsByAuth.get(player.auth);
    if (session) {
      session.isLoggedIn = true;
      session.registeredThisSession = true;
      clearPublicAuthTimers(session);
    } else {
      sessionsByAuth.set(player.auth, {
        auth: player.auth,
        playerId: player.id,
        name: player.name,
        isLoggedIn: true,
        registeredThisSession: true,
        warningTimer: null,
        kickTimer: null,
        joinedAt: Date.now(),
      });
    }

    room.setPlayerTeam(player.id, Teams.RUNNERS);
    sendSuccessMessage(room, PUBLIC_MESSAGES.LOGIN_SUCCESS(), player.id);
    return true;
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      sendErrorMessage(room, PUBLIC_MESSAGES.DATABASE_UNAVAILABLE(), player.id);
      return true;
    }

    console.error("[publicAuth] login failed:", error);
    sendErrorMessage(room, PUBLIC_MESSAGES.DATABASE_UNAVAILABLE(), player.id);
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
    COLORS.LIGHT_GREEN,
    FONTS.NORMAL,
  );
}
