import { PlayerInfo } from "../../changePlayerState/playerList";
import { leagueScuderia } from "../../scuderias/scuderias";
import { vectorSpeed } from "../../utils";

export function engineGripCalc(
  p: PlayerInfo,
  grip: number,
  playerDisc: DiscPropertiesObject
) {
  if (!p.leagueScuderia) {
    return grip;
  }

  const scud = leagueScuderia[p.leagueScuderia];
  if (!scud || !scud.engine) return grip;

  const engine = scud.engine;

  const speed = vectorSpeed(playerDisc.xspeed, playerDisc.yspeed);

  let boost = 0;
  let zone = "";

  if (speed <= 33) {
    boost = engine.initialAcceleration;
    zone = "INITIAL";
  } else if (speed <= 66) {
    boost = engine.medialAcceleration;
    zone = "MEDIAL";
  } else {
    boost = engine.finalAcceleration;
    zone = "FINAL";
  }

  const finalGrip = grip + boost;

  // 🔍 LOGS DETALHADOS
  console.log(
    `🛠 EngineGripCalc`,
    `\n• Scuderia: ${p.leagueScuderia}`,
    `\n• Speed: ${speed}`,
    `\n• Zone: ${zone}`,
    `\n• Engine Boost Applied: ${boost}`,
    `\n• Grip Before: ${grip}`,
    `\n• Grip After:  ${finalGrip}`
  );

  return finalGrip;
}

//!constants ASTON_MAIA_ENGINE_INITIAL_ACCELERATION_BOOST 0.005
