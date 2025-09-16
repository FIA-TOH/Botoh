import { LeagueTeam } from "../../teams/teams";

export function handleSeeTeams(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  let message = "Name | Tag\n-------------\n";

  for (const teamKey in LeagueTeam) {
    if (Object.prototype.hasOwnProperty.call(LeagueTeam, teamKey)) {
      const team = LeagueTeam[teamKey];
      message += `${team.name} | ${team.tag}\n`;
    }
  }

  room.sendAnnouncement(message, byPlayer.id);
}
