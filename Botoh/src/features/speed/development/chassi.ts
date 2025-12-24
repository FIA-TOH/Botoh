import { PlayerInfo, playerList } from "../../changePlayerState/playerList";
import { leagueScuderia } from "../../scuderias/scuderias";
import { constants } from "../constants";

const NERF_FACTOR = 100000;

function toDecimal(nerf: number) {
  return -(nerf / NERF_FACTOR);
}

function calcAccelerationNerf(grip: number, accelerationNerf: number) {
  return grip + toDecimal(accelerationNerf);
}

export function chassiGripCalc(p: PlayerInfo, grip: number) {
  if (!p.leagueScuderia) return grip;

  const scud = leagueScuderia[p.leagueScuderia];
  if (!scud || !scud.chassis) return grip;

  const chassis = scud.chassis;

  const finalGrip = calcAccelerationNerf(grip, chassis.accelerationNerf);

  return finalGrip;
}

export function getPlayerSlipstreamBoost(player: PlayerObject) {
  const pInfo = playerList[player.id];
  if (!pInfo.leagueScuderia) return constants.MAX_SLIPSTREAM;

  const scud = leagueScuderia[pInfo.leagueScuderia];
  if (!scud || !scud.chassis) return constants.MAX_SLIPSTREAM;

  const nerf = scud.chassis.slipstreamNerf ?? 0;

  const slipNerf = nerf / NERF_FACTOR;

  let newMax = constants.MAX_SLIPSTREAM - slipNerf;
  if (newMax < 0) newMax = 0;

  return newMax;
}

// export function getCarDirtyAir(p: PlayerObject) {
//   const info = playerList[p.id];
//   if (!info.leagueScuderia) return constants.DIRTY_AIR_DEFAULT;

//   const scud = leagueScuderia[info.leagueScuderia];
//   if (!scud?.chassis) return constants.DIRTY_AIR_DEFAULT;

//   const boost = scud.chassis.dirtyAirBoost ?? 0;

//   // dirtyAirBoost 10 → 0.0001
//   const converted = boost / 100000;

//   return converted;
// }
