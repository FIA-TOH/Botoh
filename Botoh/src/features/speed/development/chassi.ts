import { PlayerInfo } from "../../changePlayerState/playerList";
import { leagueScuderia } from "../../scuderias/scuderias";

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
