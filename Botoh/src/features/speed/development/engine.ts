import { PlayerInfo, playerList } from "../../changePlayerState/playerList";
import { leagueScuderia } from "../../scuderias/scuderias";
import { vectorSpeed } from "../../utils";
import { maxSpeedFromGrip } from "../getMaxSpeed";
const smoothedBoostMap: Record<number, number> = {};
const NERF_FACTOR = 100000;

function toDecimal(nerf: number) {
  return -(nerf / NERF_FACTOR);
}

function calcAccelerationGrip(
  playerId: number,
  speed: number,
  engine: any,
  baseGrip: number,
  room: RoomObject
) {
  const maxSpeed = maxSpeedFromGrip(baseGrip);
  const initialEnd = maxSpeed * 0.5; // until 50%
  const medialEnd = maxSpeed * 0.8; // until 80%

  let targetBoost = 0;

  if (speed <= initialEnd) {
    // room.setPlayerAvatar(playerId, "I");
    targetBoost = toDecimal(engine.initialAccelerationNerf);
  } else if (speed <= medialEnd) {
    // room.setPlayerAvatar(playerId, "M");
    targetBoost = toDecimal(engine.medialAccelerationNerf);
  } else {
    // room.setPlayerAvatar(playerId, "F");
    targetBoost = toDecimal(engine.finalAccelerationNerf);
  }

  const prevBoost = smoothedBoostMap[playerId] ?? targetBoost;

  const smoothFactor = 0.1;
  const smoothedBoost = prevBoost + (targetBoost - prevBoost) * smoothFactor;

  smoothedBoostMap[playerId] = smoothedBoost;

  // console.log(
  //   `🛠 EngineGripCalc (Suavizado)`,
  //   `\n• Speed: ${speed}`,
  //   `\n• Target Boost: ${targetBoost}`,
  //   `\n• Smoothed Boost: ${smoothedBoost}`,
  //   `\n• Grip Before: ${baseGrip}`,
  //   `\n• Grip After:  ${baseGrip + smoothedBoost}`
  // );

  return baseGrip + smoothedBoost;
}

function calcTopSpeedLimitGrip(
  grip: number,
  speed: number,
  topSpeedBoostNerf: number,
  slipstream: number
) {
  const baseMaxSpeed = maxSpeedFromGrip(grip);

  const finalMaxSpeed = baseMaxSpeed * (1 - topSpeedBoostNerf / 100);

  const softZone = finalMaxSpeed * 0.9;

  if (speed <= softZone) return grip;

  if (speed <= finalMaxSpeed) {
    const ratio = (speed - softZone) / (finalMaxSpeed - softZone);
    const drag = ratio * 0.0003;
    return grip - drag;
  }

  const excess = speed - finalMaxSpeed;
  const hardDrag = 0.0003 + excess * 0.0001;

  return grip - hardDrag + slipstream;
}

export function engineGripCalc(
  p: PlayerInfo,
  grip: number,
  playerDisc: DiscPropertiesObject,
  player: PlayerObject,
  room: RoomObject
) {
  if (!p.leagueScuderia) return grip;

  const scud = leagueScuderia[p.leagueScuderia];
  if (!scud || !scud.engine) return grip;

  const engine = scud.engine;
  const speed = vectorSpeed(playerDisc.xspeed, playerDisc.yspeed);
  const slip = playerList[player.id]?.finalSlipstream ?? 0;

  const gripAfterAcceleration = calcAccelerationGrip(
    player.id,
    speed,
    engine,
    grip,
    room
  );

  const finalGrip = calcTopSpeedLimitGrip(
    gripAfterAcceleration,
    speed,
    engine.topSpeedBoostNerf,
    slip
  );

  return finalGrip;
}

//!constants ASTON_MAIA_ENGINE_INITIAL_ACCELERATION_BOOST -0.005
//!constants ASTON_MAIA_ENGINE_MEDIAL_ACCELERATION_BOOST -0.002
//!constants ASTON_MAIA_ENGINE_FINAL_ACCELERATION_BOOST -0.001

//!constants PENSHIRYU_ENGINE_INITIAL_ACCELERATION_BOOST -0.001
//!constants PENSHIRYU_ENGINE_MEDIAL_ACCELERATION_BOOST -0.002
//!constants PENSHIRYU_ENGINE_FINAL_ACCELERATION_BOOST -0.005
