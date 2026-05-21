import { PlayerInfo } from "../../changePlayerState/playerList";
import { getLeagueScuderia } from "../../scuderias/scuderias";

export function getPlayerScuderia(playerInfo: PlayerInfo) {
  return getLeagueScuderia(playerInfo.leagueScuderia);
}
