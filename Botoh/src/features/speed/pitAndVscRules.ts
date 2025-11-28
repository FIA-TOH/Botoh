import { gameMode, GameMode } from "../changeGameState/changeGameModes";
import { ACTUAL_CIRCUIT } from "../roomFeatures/stadiumChange";
import { tyresActivated } from "../tires&pits/tires";
import { PlayerInfo } from "../changePlayerState/playerList";
import { constants } from "./constants";

export function applyPitAndVscRules(
  p: PlayerObject,
  disc: DiscPropertiesObject,
  room: RoomObject,
  gripMultiplier: number,
  playerInfo: PlayerInfo,
  currentTime: number,
  vsc: boolean
) {
  let limiter = 0;

  if (playerInfo.inPitlane) {
    limiter = ACTUAL_CIRCUIT.info.pitSpeed ?? constants.DEFAULT_PIT_SPEED;
  } else if (vsc) {
    limiter =
      gameMode === GameMode.INDY
        ? constants.SAFETY_CAR_INDY_SPEED
        : constants.SAFETY_CAR_SPEED;
  }

  const { xspeed: x, yspeed: y } = disc;

  if (limiter > 0) {
    room.setPlayerDiscProperties(p.id, {
      xgravity: -x * (1 - limiter),
      ygravity: -y * (1 - limiter),
    });
  } else if (tyresActivated && gripMultiplier) {
    room.setPlayerDiscProperties(p.id, {
      xgravity: -x * (1 - gripMultiplier),
      ygravity: -y * (1 - gripMultiplier),
    });
  }
}
