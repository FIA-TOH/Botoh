import { PlayerInfo } from "../../changePlayerState/playerList";
import { LeagueTeam } from "../../teams/teams";

export function getPlayerTeam(playerInfo: PlayerInfo) {
  if (!playerInfo.leagueTeam) return null;
  const teamKey = playerInfo.leagueTeam as keyof typeof LeagueTeam;
  if (!LeagueTeam.hasOwnProperty(teamKey)) return null;
  return LeagueTeam[teamKey];
}
