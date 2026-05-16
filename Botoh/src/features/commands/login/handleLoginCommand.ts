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
  const password = args.join(" ");
  if (!password) {
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
        }),
      },
    );

    const data = (await response.json()) as LoginResponse;
    if (!response.ok || !data.success || !data.user) {
      sendErrorMessage(room, MESSAGES.LOGIN_ERROR(), byPlayer.id);
      return;
    }

    const player = playerList[byPlayer.id];
    player.isLogged = true;
    player.shortName = data.user.shortUsername ?? player.shortName;
    player.driverNumber = data.user.driverNumber ?? player.driverNumber;
    player.leagueScuderia = data.user.teamId;

    if (
      data.user.teamId &&
      data.user.teamName &&
      data.user.teamTag
    ) {
      registerLeagueScuderia(data.user.teamId, {
        name: data.user.teamName,
        tag: data.user.teamTag,
        color: parseTeamColor(data.user.teamColor),
      });
    }

    sendSuccessMessage(room, MESSAGES.LOGIN_SUCCESS(), byPlayer.id);
  } catch {
    sendErrorMessage(room, MESSAGES.LOGIN_ERROR(), byPlayer.id);
  }
}
