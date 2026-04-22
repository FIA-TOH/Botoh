import { playerList, PlayerInfo } from "../changePlayerState/playerList";
import { getPlayerAndDiscs } from "../playerFeatures/getPlayerAndDiscs";
import { vsc } from "../safetyCar/vsc";
import { getRunningPlayers, vectorSpeed } from "../utils";
import { calculateTotalGripMultiplier } from "./grip/calculateTotalGripMultiplier";
import { applyPitAndVscRules } from "./pitAndVscRules";
import { calculateSlipstreamEffect } from "./slipstream/slipstreamUtils";
import { getDirectionChangerGravity } from "./directionChanger";

export function controlPlayerSpeed(
  playersAndDiscsSubset: { p: PlayerObject; disc: DiscPropertiesObject }[],
  room: RoomObject
) {
  const currentTime = room.getScores()?.time || 0;

  const playersAndDiscs = getPlayerAndDiscs(room);

  const playersRunning = getRunningPlayers(playersAndDiscs);

  playersAndDiscsSubset.forEach(({ p, disc }) => {
    const playerInfo = playerList[p.id];

    if (playerInfo.inPitStop) {
      room.setPlayerDiscProperties(p.id, {
        xspeed: 0,
        yspeed: 0,
        xgravity: 0,
        ygravity: 0,
      });
      return;
    }

    const currentSpeed = vectorSpeed(disc.xspeed, disc.yspeed);

    const slipstreamData = calculateSlipstreamEffect(
      p,
      disc,
      playersRunning,
      currentTime,
      playerInfo,
      vsc
    );

    const gripMultiplier = calculateTotalGripMultiplier(
      p,
      disc,
      playerInfo,
      slipstreamData.effectiveSlipstream,
      currentTime,
      room
    );

    const baseGravity = applyPitAndVscRules(
      p,
      disc,
      room,
      gripMultiplier,
      playerInfo,
      currentTime,
      vsc
    );

    const directionChangerGravity = getDirectionChangerGravity(
      p,
      playerInfo,
      currentTime,
      currentSpeed,
      disc,
      room
    );

    room.setPlayerDiscProperties(p.id, {
      xgravity: baseGravity.xgravity + directionChangerGravity.x,
      ygravity: baseGravity.ygravity + directionChangerGravity.y,
    });

    playerList[p.id] = playerInfo;
  });
}

function calculateCurveResistance(
  playerInfo: PlayerInfo,
  disc: DiscPropertiesObject,
): { x: number; y: number } {
  const x = disc.xspeed;
  const y = disc.yspeed;
  const speed = Math.sqrt(x * x + y * y);
  const MIN_SPEED_FOR_RESISTANCE = 0.15;
  const MIN_CURVE_ANGLE = 0.15;

  if (speed < MIN_SPEED_FOR_RESISTANCE) {
    return { x: 0, y: 0 };
  }

  const unitX = x / speed;
  const unitY = y / speed;

  if (!playerInfo.lastDir) {
    playerInfo.lastDir = { x: unitX, y: unitY };
    return { x: 0, y: 0 };
  }

  const dot =
    playerInfo.lastDir.x * unitX + playerInfo.lastDir.y * unitY;
  const clampedDot = Math.min(1, Math.max(-1, dot));
  const angle = Math.acos(clampedDot);

  if (angle <= MIN_CURVE_ANGLE) {
    playerInfo.lastDir = { x: unitX, y: unitY };
    playerInfo.curveResistanceTicks = 0;
    return { x: 0, y: 0 };
  }

  const MAX_CURVE_RESISTANCE_TICKS = 6;

  if (!playerInfo.curveResistanceTicks || playerInfo.curveResistanceTicks <= 0) {
    playerInfo.curveResistanceTicks = MAX_CURVE_RESISTANCE_TICKS;
  }

  const resistanceStrength = Math.min(0.03, (1 - clampedDot) * 0.04 + 0.005);
  const errorX = playerInfo.lastDir.x - unitX;
  const errorY = playerInfo.lastDir.y - unitY;
  const decay = playerInfo.curveResistanceTicks / MAX_CURVE_RESISTANCE_TICKS;

  const extraX = errorX * resistanceStrength * speed * decay;
  const extraY = errorY * resistanceStrength * speed * decay;

  playerInfo.curveResistanceTicks = Math.max(0, playerInfo.curveResistanceTicks - 1);
  if (playerInfo.curveResistanceTicks === 0) {
    playerInfo.lastDir = { x: unitX, y: unitY };
  }

  return {
    x: extraX,
    y: extraY,
  };
}

