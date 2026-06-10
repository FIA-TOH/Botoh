import { Teams } from "../changeGameState/teams";
import { playerList } from "../changePlayerState/playerList";
import { ACTUAL_CIRCUIT } from "../roomFeatures/stadiumChange";

export function movePlayerToTeamCircuitBox(player: PlayerObject, room: RoomObject) {
  if (player.team !== Teams.RUNNERS) return false;

  const playerInfo = playerList[player.id];
  if (!playerInfo?.isLogged || !playerInfo.leagueScuderia) {
    return false;
  }
  const circuitName = ACTUAL_CIRCUIT?.info?.name;
  const coordinates = circuitName
    ? playerInfo.boxCoordinatesByCircuit[circuitName]
    : playerInfo.boxCoordinates;

  if (!coordinates) return false;

  room.setPlayerDiscProperties(player.id, {
    x: coordinates.x,
    y: coordinates.y,
    xspeed: 0,
    yspeed: 0,
  });

  return true;
}
