import { COLORS, sendErrorMessage, sendNonLocalizedSmallChatMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { playerList } from "../../changePlayerState/playerList";
import { getLeagueScuderia } from "../../scuderias/scuderias";

export function handleSeeLoginCommand(
  byPlayer: PlayerObject,
  _args: string[],
  room: RoomObject,
) {
  if (!byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.ADMIN_ONLY(), byPlayer.id);
    return;
  }

  const roomPlayers = room.getPlayerList();
  const notLogged = roomPlayers.filter(
    (player) => playerList[player.id]?.isLogged !== true,
  );

  if (notLogged.length === 0) {
    sendNonLocalizedSmallChatMessage(
      room,
      "All players are logged.",
      byPlayer.id,
      COLORS.GREEN,
    );
  } else {
    sendNonLocalizedSmallChatMessage(
      room,
      `NNot logged in: ${notLogged.map((player) => player.name).join(", ")}`,
      byPlayer.id,
      COLORS.YELLOW,
    );
  }

  const playersByScuderia = new Map<string, { name: string; players: string[] }>();

  roomPlayers.forEach((player) => {
    const scuderia = getLeagueScuderia(playerList[player.id]?.leagueScuderia);
    if (!scuderia) return;

    const current = playersByScuderia.get(scuderia.name) ?? {
      name: scuderia.name,
      players: [],
    };
    current.players.push(player.name);
    playersByScuderia.set(scuderia.name, current);
  });

  const oversizedTeams = [...playersByScuderia.values()].filter(
    (team) => team.players.length > 2,
  );

  if (oversizedTeams.length === 0) {
    sendNonLocalizedSmallChatMessage(
      room,
      "No team has more than 2 players in the room.",
      byPlayer.id,
      COLORS.GREEN,
    );
    return;
  }

  oversizedTeams.forEach((team) => {
    sendNonLocalizedSmallChatMessage(
      room,
      `${team.name}: ${team.players.join(", ")}`,
      byPlayer.id,
      COLORS.YELLOW,
    );
  });
}
