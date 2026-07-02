import {
  GeneralGameMode,
  generalGameMode,
} from "../changeGameState/changeGameModes";
import { Teams } from "../changeGameState/teams";
import { applyPlayerCollision } from "../changePlayerState/playerCollision";
import { playerList } from "../changePlayerState/playerList";
import { ACTUAL_CIRCUIT } from "../roomFeatures/stadiumChange";

let teamCircuitBoxesEnabled = false;

export function setTeamCircuitBoxesEnabled(enabled: boolean) {
  teamCircuitBoxesEnabled = enabled;
}

export function movePlayerToTeamCircuitBox(player: PlayerObject, room: RoomObject) {
  if (!teamCircuitBoxesEnabled) return false;
  if (generalGameMode === GeneralGameMode.GENERAL_RACE) return false;
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

  playerInfo.inPitlane = true;
  applyPlayerCollision(room, player.id);
  room.setPlayerDiscProperties(player.id, {
    x: coordinates.x,
    y: coordinates.y,
    xspeed: 0,
    yspeed: 0,
  });

  return true;
}
