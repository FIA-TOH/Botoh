import { playerList } from "../../changePlayerState/playerList";
import { sendErrorMessage, sendSuccessMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { registerLeagueScuderia } from "../../scuderias/scuderias";

type LoginUser = {
  username?: string;
  shortUsername: string | null;
  driverNumber: number | null;
  teamId: string | null;
  teamName: string | null;
  teamTag: string | null;
  teamEmoji: string | null;
  teamColor: string | null;
  pitLevel?: number | null;
  weatherLevel?: number | null;
  driverCategory?: "starter" | "reserve" | null;
};

type LoginResponse = {
  success: boolean;
  user?: LoginUser;
  message?: string;
};

function parseTeamColor(color: string | null) {
  if (!color) return 0xb3b3b3;
  return Number.parseInt(color.replace("#", ""), 16);
}

function parseFacilityLevel(level?: number | null) {
  const value = level ?? 0;
  if (!Number.isFinite(value)) return 0;
  return Math.min(5, Math.max(0, Math.trunc(value)));
}

function clearLoginState(playerId: number) {
  const player = playerList[playerId];
  if (!player) return;

  player.isLogged = false;
  player.leagueScuderia = null;
  player.isFirstDriver = false;
  player.driverCategory = null;
  player.loggedUsername = null;
}

export function clearLoginStateIfUsernameChanged(player: PlayerObject) {
  const playerState = playerList[player.id];
  if (!playerState?.isLogged) return;

  if (
    !playerState.loggedUsername ||
    playerState.loggedUsername.toLowerCase() !== player.name.toLowerCase()
  ) {
    clearLoginState(player.id);
  }
}

export function rebalanceFirstDriverForTeam(room: RoomObject, teamId: string | null | undefined) {
  if (!teamId) return;

  const teamPlayers = room.getPlayerList().filter((roomPlayer) => {
    const roomPlayerState = playerList[roomPlayer.id];
    return (
      roomPlayerState?.isLogged === true &&
      roomPlayerState.leagueScuderia === teamId
    );
  });

  teamPlayers.forEach((roomPlayer) => {
    const roomPlayerState = playerList[roomPlayer.id];
    if (roomPlayerState) {
      roomPlayerState.isFirstDriver = false;
    }
  });

  const firstStarter = teamPlayers.find(
    (roomPlayer) => playerList[roomPlayer.id]?.driverCategory === "starter",
  );
  const firstReserve = teamPlayers.find(
    (roomPlayer) => playerList[roomPlayer.id]?.driverCategory === "reserve",
  );
  const firstDriver = firstStarter ?? firstReserve;

  if (firstDriver && playerList[firstDriver.id]) {
    playerList[firstDriver.id].isFirstDriver = true;
  }
}

export async function handleLoginCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject,
) {
  const [password, rawTeamTag, ...extraArgs] = args;
  const teamTag = rawTeamTag?.trim().toUpperCase();

  if (!password || extraArgs.length > 0) {
    sendErrorMessage(room, MESSAGES.LOGIN_USAGE(), byPlayer.id);
    return;
  }

  try {
    const response = await fetch(
      `${process.env.BACKEND_API_URL ?? "http://localhost:3001"}/api/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: byPlayer.name,
          password,
          ...(teamTag ? { teamTag } : {}),
        }),
      },
    );

    const data = (await response.json()) as LoginResponse;
    if (!response.ok || !data.success || !data.user) {
      sendErrorMessage(room, MESSAGES.LOGIN_ERROR(), byPlayer.id);
      return;
    }

    const loggedUser = data.user;
    const player = playerList[byPlayer.id];
    const previousTeamId = player.leagueScuderia;

    player.isLogged = true;
    player.shortName = loggedUser.shortUsername ?? player.shortName;
    player.driverNumber = loggedUser.driverNumber ?? player.driverNumber;
    player.leagueScuderia = loggedUser.teamId;
    player.driverCategory = loggedUser.driverCategory ?? null;
    player.loggedUsername = loggedUser.username ?? byPlayer.name;
    player.isFirstDriver = false;

    if (
      loggedUser.teamId &&
      loggedUser.teamName &&
      loggedUser.teamTag
    ) {
      registerLeagueScuderia(loggedUser.teamId, {
        name: loggedUser.teamName,
        tag: loggedUser.teamTag,
        emoji: loggedUser.teamEmoji ?? undefined,
        color: parseTeamColor(loggedUser.teamColor),
        pitLevel: parseFacilityLevel(loggedUser.pitLevel),
        weatherLevel: parseFacilityLevel(loggedUser.weatherLevel),
      });
    }

    if (previousTeamId && previousTeamId !== loggedUser.teamId) {
      rebalanceFirstDriverForTeam(room, previousTeamId);
    }
    rebalanceFirstDriverForTeam(room, loggedUser.teamId);

    sendSuccessMessage(room, MESSAGES.LOGIN_SUCCESS(), byPlayer.id);
  } catch {
    sendErrorMessage(room, MESSAGES.LOGIN_ERROR(), byPlayer.id);
  }
}
