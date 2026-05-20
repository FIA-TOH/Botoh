import { playerList } from "../../changePlayerState/playerList";
import { sendErrorMessage, sendSuccessMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { registerLeagueScuderia } from "../../scuderias/scuderias";

type LoginUser = {
  shortUsername: string | null;
  driverNumber: number | null;
  teamId: string | null;
  teamName: string | null;
  teamTag: string | null;
  teamColor: string | null;
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
    const hasLoggedTeammate = loggedUser.teamId
      ? room.getPlayerList().some((roomPlayer) => {
          if (roomPlayer.id === byPlayer.id) return false;

          const roomPlayerState = playerList[roomPlayer.id];
          return (
            roomPlayerState?.isLogged === true &&
            roomPlayerState.leagueScuderia === loggedUser.teamId
          );
        })
      : false;

    player.isLogged = true;
    player.shortName = loggedUser.shortUsername ?? player.shortName;
    player.driverNumber = loggedUser.driverNumber ?? player.driverNumber;
    player.leagueScuderia = loggedUser.teamId;
    player.isFirstDriver = Boolean(loggedUser.teamId) && !hasLoggedTeammate;

    if (
      loggedUser.teamId &&
      loggedUser.teamName &&
      loggedUser.teamTag
    ) {
      registerLeagueScuderia(loggedUser.teamId, {
        name: loggedUser.teamName,
        tag: loggedUser.teamTag,
        color: parseTeamColor(loggedUser.teamColor),
      });
    }

    sendSuccessMessage(room, MESSAGES.LOGIN_SUCCESS(), byPlayer.id);
  } catch {
    sendErrorMessage(room, MESSAGES.LOGIN_ERROR(), byPlayer.id);
  }
}
