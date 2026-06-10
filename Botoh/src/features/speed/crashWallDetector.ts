import { CrashWallDetector } from "../../circuits/Circuit";
import { ACTUAL_CIRCUIT } from "../roomFeatures/stadiumChange";
import { sendAlertMessage } from "../chat/chat";
import { MESSAGES } from "../chat/messages";
import { handleAvatar, Situacions } from "../changePlayerState/handleAvatar";
import { playerList } from "../changePlayerState/playerList";
import { vectorSpeed } from "../utils";
import { getRaceControlState, RaceControlState } from "../commands/flagsAndVSC/raceControl";

type Point = [number, number];
type Segment = [Point, Point];

const detectorSegmentsCache = new Map<string, Segment[]>();
const playerTouchedCrashWallDetectors = new Map<number, Set<string>>();
const previousPlayerSpeed = new Map<number, number>();
const lastPlayerDamageAt = new Map<number, number>();
const DAMAGE_COOLDOWN_MS = 1000;
const CRASH_DAMAGE_PER_SPEED = 0.375;

export let damageEnabled = false;

export function enableDamage(enable: boolean) {
  damageEnabled = enable;
}

function isDamageSuspendedByRaceControl() {
  const raceControl = getRaceControlState();

  return raceControl.flag === RaceControlState.YellowFlag
    || raceControl.neutralization === RaceControlState.SafetyCar
    || raceControl.neutralization === RaceControlState.VirtualSafetyCar;
}

function clampCurvature(curvatura: number): number {
  return Math.max(-359, Math.min(359, curvatura));
}

function pointToSegmentDistanceSq(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  const param = lenSq !== 0 ? Math.max(0, Math.min(1, dot / lenSq)) : 0;
  const xx = x1 + param * C;
  const yy = y1 + param * D;
  const dx = px - xx;
  const dy = py - yy;

  return dx * dx + dy * dy;
}

function getCacheKey(detector: CrashWallDetector) {
  return [
    detector.index,
    detector.v0[0],
    detector.v0[1],
    detector.v1[0],
    detector.v1[1],
    detector.curvatura,
  ].join(":");
}

function getStraightSegment(detector: CrashWallDetector): Segment[] {
  return [[detector.v0, detector.v1]];
}

function buildCurvedSegments(detector: CrashWallDetector): Segment[] {
  const curvatura = clampCurvature(detector.curvatura);
  const angleDegrees = Math.abs(curvatura);

  if (angleDegrees === 0) return getStraightSegment(detector);

  const [x0, y0] = detector.v0;
  const [x1, y1] = detector.v1;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const distance = Math.hypot(dx, dy);

  if (distance === 0) return getStraightSegment(detector);

  const angleRadians = (angleDegrees * Math.PI) / 180;
  const halfAngle = angleRadians / 2;
  const sinHalfAngle = Math.sin(halfAngle);
  const tanHalfAngle = Math.tan(halfAngle);

  if (Math.abs(sinHalfAngle) < 0.0001 || Math.abs(tanHalfAngle) < 0.0001) {
    return getStraightSegment(detector);
  }

  const direction = curvatura > 0 ? 1 : -1;
  const midX = (x0 + x1) / 2;
  const midY = (y0 + y1) / 2;
  const normalX = -dy / distance;
  const normalY = dx / distance;
  const centerOffset = direction * (distance / 2) / tanHalfAngle;
  const centerX = midX + normalX * centerOffset;
  const centerY = midY + normalY * centerOffset;
  const radius = distance / (2 * sinHalfAngle);
  const startAngle = Math.atan2(y0 - centerY, x0 - centerX);
  const deltaAngle = direction * angleRadians;
  const steps = Math.max(6, Math.ceil(angleDegrees / 15));
  const points: Point[] = [];

  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    const angle = startAngle + deltaAngle * progress;
    points.push([
      centerX + Math.cos(angle) * radius,
      centerY + Math.sin(angle) * radius,
    ]);
  }

  const segments: Segment[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    segments.push([points[i], points[i + 1]]);
  }

  return segments;
}

function getDetectorSegments(detector: CrashWallDetector): Segment[] {
  const cacheKey = getCacheKey(detector);
  const cachedSegments = detectorSegmentsCache.get(cacheKey);

  if (cachedSegments) return cachedSegments;

  const segments = buildCurvedSegments(detector);
  detectorSegmentsCache.set(cacheKey, segments);

  return segments;
}

function isTouchingDetector(disc: DiscPropertiesObject, detector: CrashWallDetector) {
  const radiusSq = disc.radius * disc.radius;

  return getDetectorSegments(detector).some(([v0, v1]) => {
    return pointToSegmentDistanceSq(
      disc.x,
      disc.y,
      v0[0],
      v0[1],
      v1[0],
      v1[1],
    ) <= radiusSq;
  });
}

function roundDamage(value: number) {
  return Math.round(value * 10) / 10;
}

function applyCrashDamage(playerId: number, impactSpeed: number) {
  const playerInfo = playerList[playerId];
  if (!playerInfo) return null;

  const now = Date.now();
  const lastDamageAt = lastPlayerDamageAt.get(playerId) ?? 0;
  if (now - lastDamageAt < DAMAGE_COOLDOWN_MS) return null;

  const currentDamage = playerInfo.carDamage ?? 0;
  const calculatedDamage = roundDamage(impactSpeed * CRASH_DAMAGE_PER_SPEED);
  const newDamage = roundDamage(Math.min(100, currentDamage + calculatedDamage));
  const damageTaken = roundDamage(newDamage - currentDamage);

  playerInfo.carDamage = newDamage;
  lastPlayerDamageAt.set(playerId, now);

  return {
    damageTaken,
    newDamage,
  };
}

export function detectCrashWallDetectors(
  playersAndDiscs: { p: PlayerObject; disc: DiscPropertiesObject }[],
  room: RoomObject,
) {
  if (!damageEnabled) return;

  const detectors = ACTUAL_CIRCUIT?.info?.CrashWallDetector;
  if (!detectors?.length) return;
  const damageSuspended = isDamageSuspendedByRaceControl();

  for (const pad of playersAndDiscs) {
    if (!pad.disc) continue;

    const currentSpeed = vectorSpeed(pad.disc.xspeed, pad.disc.yspeed);
    const previousSpeed = previousPlayerSpeed.get(pad.p.id) ?? 0;

    if (!playerTouchedCrashWallDetectors.has(pad.p.id)) {
      playerTouchedCrashWallDetectors.set(pad.p.id, new Set());
    }

    const touchedSet = playerTouchedCrashWallDetectors.get(pad.p.id)!;

    for (const detector of detectors) {
      const detectorTouchKey = getCacheKey(detector);
      const isTouching = isTouchingDetector(pad.disc, detector);

      if (damageSuspended) {
        if (isTouching) {
          touchedSet.add(detectorTouchKey);
        } else {
          touchedSet.delete(detectorTouchKey);
        }
        continue;
      }

      if (isTouching && !touchedSet.has(detectorTouchKey)) {
        const speed = Math.max(currentSpeed, previousSpeed);
        const damage = applyCrashDamage(pad.p.id, speed);

        if (damage) {
          sendAlertMessage(
            room,
            MESSAGES.CAR_DAMAGE_TAKEN(
              damage.damageTaken.toString(),
              damage.newDamage.toString(),
            ),
            pad.p.id,
          );

          if (damage.damageTaken > 0) {
            playerList[pad.p.id].lastLapValid = false;
            handleAvatar(Situacions.CrashDamage, pad.p, room);
          }
        }

        touchedSet.add(detectorTouchKey);
      }

      if (!isTouching && touchedSet.has(detectorTouchKey)) {
        touchedSet.delete(detectorTouchKey);
      }
    }

    previousPlayerSpeed.set(pad.p.id, currentSpeed);
  }
}
