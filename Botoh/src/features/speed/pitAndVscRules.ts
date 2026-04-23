import { gameMode, GameMode } from "../changeGameState/changeGameModes";
import { ACTUAL_CIRCUIT } from "../roomFeatures/stadiumChange";
import { tyresActivated } from "../tires&pits/tires";
import { PlayerInfo } from "../changePlayerState/playerList";
import { constants } from "./constants";

export interface GravityVector {
  xgravity: number;
  ygravity: number;
}

export function getPitAndVscGravity(
  p: PlayerObject,
  disc: DiscPropertiesObject,
  gripMultiplier: number,
  playerInfo: PlayerInfo,
  currentTime: number,
  vsc: boolean,
  isLapped: boolean = false,
): GravityVector {
  let limiter = 0;

  if (playerInfo.inPitlane) {
    limiter = ACTUAL_CIRCUIT.info.pitSpeed ?? constants.DEFAULT_PIT_SPEED;
  } else if (vsc && !isLapped) {
    // Only apply safety car speed if NOT lapped
    limiter =
      gameMode === GameMode.INDY
        ? constants.SAFETY_CAR_INDY_SPEED
        : constants.SAFETY_CAR_SPEED;
  }

  const { xspeed: x, yspeed: y } = disc;

  if (limiter > 0) {
    return {
      xgravity: -x * (1 - limiter),
      ygravity: -y * (1 - limiter),
    };
  }

  return {
    xgravity: -x * (1 - gripMultiplier),
    ygravity: -y * (1 - gripMultiplier),
  };
}

export function applyPitAndVscRules(
  p: PlayerObject,
  disc: DiscPropertiesObject,
  room: RoomObject,
  gripMultiplier: number,
  playerInfo: PlayerInfo,
  currentTime: number,
  vsc: boolean,
  isLapped: boolean = false,
): GravityVector {
  const gravity = getPitAndVscGravity(
    p,
    disc,
    gripMultiplier,
    playerInfo,
    currentTime,
    vsc,
    isLapped,
  );

  room.setPlayerDiscProperties(p.id, gravity);
  return gravity;
}
