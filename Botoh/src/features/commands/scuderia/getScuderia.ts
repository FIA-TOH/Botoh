import { PlayerInfo } from "../../changePlayerState/playerList";
import { leagueScuderia } from "../../scuderias/scuderias";

export function getPlayerScuderia(playerInfo: PlayerInfo) {
  if (!playerInfo.leagueScuderia) return null;
  const scuderiaKey = playerInfo.leagueScuderia as keyof typeof leagueScuderia;
  if (!leagueScuderia.hasOwnProperty(scuderiaKey)) return null;
  return leagueScuderia[scuderiaKey];
}
