import { playerList } from "../../changePlayerState/playerList";
import { sendErrorMessage, sendSuccessMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { LEAGUE_MODE } from "../../hostLeague/leagueMode";
import { LeagueTeam } from "../../teams/teams";

export function handleSetTeam(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (!LEAGUE_MODE) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }

  const value = args[0];
  const player = playerList[byPlayer.id];

  if (!value) {
    room.sendAnnouncement("Error: !team [XX]", byPlayer.id, 0xff0000);
    return;
  }

  if (value in LeagueTeam) {
    const teamKey = value as keyof typeof LeagueTeam;
    player.leagueTeam = teamKey as string;

    sendSuccessMessage(
      room,
      MESSAGES.TEAM_DEFINED(
        LeagueTeam[teamKey].name.toString(),
        LeagueTeam[teamKey].tag.toString()
      ),
      byPlayer.id
    );

    return;
  }

  const teamEntry = Object.entries(LeagueTeam).find(
    ([, team]) => team.tag.toLowerCase() === value.toLowerCase()
  );

  if (teamEntry) {
    const [teamKey, team] = teamEntry;
    player.leagueTeam = teamKey as string;
    sendSuccessMessage(
      room,
      MESSAGES.TEAM_DEFINED(team.name.toString(), team.tag.toString()),
      byPlayer.id
    );
    return;
  }
  sendErrorMessage(room, MESSAGES.TEAM_ERROR(value.toString()), byPlayer.id);
}
