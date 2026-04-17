import { DirectionChangerDetector, SpecificDirection } from "../../circuits/Circuit";
import { ACTUAL_CIRCUIT } from "../roomFeatures/stadiumChange";
import { playerList, PlayerInfo } from "../changePlayerState/playerList";
import { calculateTotalDrift, driftToForceMultiplier, getCurrentTireType, shouldCalculateDrift } from "../weather/rain/driftCalculator";
import { DRIFT_CONFIG } from "../weather/driftConfig";

const playerPassedDetectors = new Map<number, Set<string>>();

function pointToSegmentDistance(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  const param = lenSq !== 0 ? dot / lenSq : -1;

  let xx: number;
  let yy: number;
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = px - xx;
  const dy = py - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

function directionToVector(direction: SpecificDirection) {
  switch (direction) {
    case SpecificDirection.RIGHT:
      return { x: 1, y: 0 };
    case SpecificDirection.LEFT:
      return { x: -1, y: 0 };
    case SpecificDirection.UP:
      return { x: 0, y: -1 };
    case SpecificDirection.DOWN:
      return { x: 0, y: 1 };
    case SpecificDirection.RIGHTUP:
      return { x: 0.7071, y: -0.7071 };
    case SpecificDirection.RIGHTDOWN:
      return { x: 0.7071, y: 0.7071 };
    case SpecificDirection.LEFTUP:
      return { x: -0.7071, y: -0.7071 };
    case SpecificDirection.LEFTDOWN:
      return { x: -0.7071, y: 0.7071 };
    default:
      return { x: 0, y: 0 };
  }
}

export function detectDirectionChangers(
  playersAndDiscs: { p: PlayerObject; disc: DiscPropertiesObject }[],
  room: RoomObject
) {
  const detectors = ACTUAL_CIRCUIT?.info?.DirectionChangerDetector;
  if (!detectors?.length) return;

  for (const pad of playersAndDiscs) {
    if (!pad.disc) continue;

    const playerId = pad.p.id;
    if (!playerPassedDetectors.has(playerId)) {
      playerPassedDetectors.set(playerId, new Set());
    }
    const passedSet = playerPassedDetectors.get(playerId)!;

    for (const detector of detectors) {
      const dist = pointToSegmentDistance(
        pad.disc.x,
        pad.disc.y,
        detector.v0[0],
        detector.v0[1],
        detector.v1[0],
        detector.v1[1]
      );

      if (dist <= pad.disc.radius && !passedSet.has(detector.index)) {
        const currentTime = room.getScores()?.time ?? 0;
        applyDirectionChangerEffect(pad.p.id, detector, currentTime);
        passedSet.add(detector.index);
      }

      if (dist > pad.disc.radius && passedSet.has(detector.index)) {
        passedSet.delete(detector.index);
      }
    }
  }
}

function applyDirectionChangerEffect(
  playerId: number,
  detector: DirectionChangerDetector,
  currentTime: number
) {
  const playerInfo = playerList[playerId];
  if (!playerInfo) return;

  const vector = directionToVector(detector.direction);
  const effectDurationSeconds = DRIFT_CONFIG.DIRECTION_CHANGER_DURATION;

  const currentTireType = getCurrentTireType(playerInfo);
  const detectorSector = detector.sector;
  const totalDrift = calculateTotalDrift(currentTireType, detectorSector);
  
  if (totalDrift === 0) {
    return;
  }
  
  const forceMultiplier = driftToForceMultiplier(totalDrift, detector.force);

  playerInfo.directionChangerEndTime = currentTime + effectDurationSeconds;
  playerInfo.directionChangerX = vector.x;
  playerInfo.directionChangerY = vector.y;
  playerInfo.directionChangerForce = forceMultiplier;
}

export function getDirectionChangerGravity(
  playerInfo: PlayerInfo,
  currentTime: number
) {
  const directionChangerEndTime = playerInfo.directionChangerEndTime;
  const vectorX = playerInfo.directionChangerX;
  const vectorY = playerInfo.directionChangerY;
  const force = playerInfo.directionChangerForce;

  if (
    directionChangerEndTime === undefined ||
    vectorX === undefined ||
    vectorY === undefined ||
    force === undefined ||
    force <= 0
  ) {
    return { x: 0, y: 0 };
  }

  const remaining = directionChangerEndTime - currentTime;
  if (remaining <= 0) {
    playerInfo.directionChangerEndTime = 0;
    playerInfo.directionChangerX = 0;
    playerInfo.directionChangerY = 0;
    playerInfo.directionChangerForce = 0;
    return { x: 0, y: 0 };
  }

  const progress = remaining / DRIFT_CONFIG.DIRECTION_CHANGER_DURATION;
  const intensity = force * progress;

  return {
    x: vectorX * intensity,
    y: vectorY * intensity,
  };

}
