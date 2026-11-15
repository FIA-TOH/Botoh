import { BankingZone } from "../../circuits/Circuit";

export const BANKING_DEFAULTS = { maxDrag: 0.001955, falloffDistance: 150, exponent: 2 };
export type BankingSettings = typeof BANKING_DEFAULTS;
export type BankingField = keyof BankingSettings;
type Point = { x: number; y: number };
type Gate = BankingZone["detectors"][number];
type GateSample = { point: Point; side: number };
type ZoneState = { inside: boolean; gates: (GateSample | undefined)[] };
type PlayerState = { previous: Point; zones: Map<BankingZone, ZoneState> };
const players = new Map<number, PlayerState>();
const overrides = new WeakMap<BankingZone, Partial<BankingSettings>>();
let enabled = true;
const GATE_EPSILON = 0.5;
const MAX_STEP_DISTANCE = 200;
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const cross = (x: number, y: number, u: number, v: number) => x * v - y * u;

export function isBankingEnabled() { return enabled; }
export function resetBankingTracking(playerId?: number) {
  if (playerId === undefined) players.clear(); else players.delete(playerId);
}
export function setBankingEnabled(value: boolean) {
  enabled = value;
  if (!value) resetBankingTracking();
}
export function isPlayerInBanking(playerId: number, zone: BankingZone) {
  return players.get(playerId)?.zones.get(zone)?.inside ?? false;
}
export function getBankingSettings(zone: BankingZone): BankingSettings {
  return { maxDrag: zone.maxDrag ?? BANKING_DEFAULTS.maxDrag,
    falloffDistance: zone.falloffDistance ?? BANKING_DEFAULTS.falloffDistance,
    exponent: zone.exponent ?? BANKING_DEFAULTS.exponent, ...overrides.get(zone) };
}
function valid(s: BankingSettings) {
  return Number.isFinite(s.maxDrag) && s.maxDrag >= 0 && s.maxDrag <= 0.05
    && Number.isFinite(s.falloffDistance) && s.falloffDistance > 0 && s.falloffDistance <= 10000
    && Number.isFinite(s.exponent) && s.exponent >= 1 && s.exponent <= 8;
}
export function configureBanking(zone: BankingZone, field: string, value: number): boolean {
  if (!Object.prototype.hasOwnProperty.call(BANKING_DEFAULTS, field)) return false;
  const next = { ...getBankingSettings(zone), [field]: value };
  if (!valid(next)) return false;
  overrides.set(zone, { ...overrides.get(zone), [field]: value });
  return true;
}
export function resetBanking(zone: BankingZone) { overrides.delete(zone); }

function distanceToSegment(p: Point, gate: Gate) {
  const [ax, ay] = gate.v0, [bx, by] = gate.v1;
  const dx = bx - ax, dy = by - ay;
  const t = clamp(((p.x - ax) * dx + (p.y - ay) * dy) / (dx * dx + dy * dy || 1));
  return Math.hypot(p.x - ax - t * dx, p.y - ay - t * dy);
}

// Exact centre-to-finite-arc distance, including endpoints outside its sweep.
export function getBankingBaseDistance(p: Point, arc: BankingZone["baseArc"]): number {
  const [ax, ay] = arc.v0, [bx, by] = arc.v1;
  const dx = bx - ax, dy = by - ay;
  if (![ax, ay, bx, by, arc.curve, p.x, p.y].every(Number.isFinite)
    || Math.abs(arc.curve) >= 360 || Math.hypot(dx, dy) === 0) return Infinity;
  if (Math.abs(arc.curve) < 0.000001) return distanceToSegment(p, arc);
  const sweep = arc.curve * Math.PI / 180;
  const cx = (ax + bx) / 2 - dy / (2 * Math.tan(sweep / 2));
  const cy = (ay + by) / 2 + dx / (2 * Math.tan(sweep / 2));
  const radius = Math.hypot(ax - cx, ay - cy);
  const start = Math.atan2(ay - cy, ax - cx);
  const angle = Math.atan2(p.y - cy, p.x - cx);
  const progress = ((Math.sign(sweep) * (angle - start) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  if (progress <= Math.abs(sweep) + 1e-9) return Math.abs(Math.hypot(p.x - cx, p.y - cy) - radius);
  return Math.min(Math.hypot(p.x - ax, p.y - ay), Math.hypot(p.x - bx, p.y - by));
}

function intersects(a: Point, b: Point, gate: Gate) {
  const rx = b.x - a.x, ry = b.y - a.y;
  const sx = gate.v1[0] - gate.v0[0], sy = gate.v1[1] - gate.v0[1];
  const denominator = cross(rx, ry, sx, sy);
  if (Math.abs(denominator) < 1e-9) return false;
  const qx = gate.v0[0] - a.x, qy = gate.v0[1] - a.y;
  const t = cross(qx, qy, sx, sy) / denominator;
  const u = cross(qx, qy, rx, ry) / denominator;
  return t >= -1e-9 && t <= 1 + 1e-9 && u >= -1e-9 && u <= 1 + 1e-9;
}

function track(playerId: number, zones: BankingZone[], p: Point) {
  let state = players.get(playerId);
  if (!state || state.zones.size !== zones.length || zones.some((zone) => !state!.zones.has(zone))
    || Math.hypot(p.x - state.previous.x, p.y - state.previous.y) > MAX_STEP_DISTANCE) {
    state = { previous: p, zones: new Map(zones.map((zone) => [zone, { inside: false, gates: [] }])) };
    players.set(playerId, state);
  }
  for (const zone of zones) {
    const active = state.zones.get(zone)!;
    zone.detectors.forEach((gate, index) => {
      const dx = gate.v1[0] - gate.v0[0], dy = gate.v1[1] - gate.v0[1];
      const length = Math.hypot(dx, dy);
      if (!length) return;
      const signedDistance = cross(dx, dy, p.x - gate.v0[0], p.y - gate.v0[1]) / length;
      // Preserve the stable side while on the gate: no repeated toggles, and
      // a centre landing exactly on the line is detected when it leaves it.
      if (Math.abs(signedDistance) <= GATE_EPSILON) return;
      const side = Math.sign(signedDistance), previous = active.gates[index];
      if (previous && previous.side !== side && intersects(previous.point, p, gate)) active.inside = !active.inside;
      active.gates[index] = { point: p, side };
    });
  }
  state.previous = p;
  return state;
}

export function getBankingGravity(
  zones: BankingZone[] | undefined,
  disc: Pick<DiscPropertiesObject, "x" | "y" | "xspeed" | "yspeed">,
  blocked = false,
  playerId?: number,
): { x: number; y: number } {
  if (playerId === undefined) return { x: 0, y: 0 };
  if (!enabled || !zones?.length || ![disc.x, disc.y].every(Number.isFinite)) {
    resetBankingTracking(playerId);
    return { x: 0, y: 0 };
  }
  const state = track(playerId, zones, { x: disc.x, y: disc.y });
  // Track crossings under restrictions too; suppress only the physical force.
  if (blocked || ![disc.xspeed, disc.yspeed].every(Number.isFinite)) return { x: 0, y: 0 };
  for (const zone of zones) {
    if (!state.zones.get(zone)?.inside) continue;
    const s = getBankingSettings(zone);
    if (!valid(s)) continue;
    const distance = getBankingBaseDistance(disc, zone.baseArc);
    const t = clamp(distance / s.falloffDistance);
    // Hold substantial resistance through the inner half, then release it
    // quickly on the outer half; the 1.5 power also softens the zero endpoint.
    const drag = s.maxDrag * Math.pow(clamp(1 - Math.pow(t, s.exponent)), 1.5);
    // No boost, angle weighting, player-radius subtraction or force clipping.
    return { x: -disc.xspeed * drag, y: -disc.yspeed * drag };
  }
  return { x: 0, y: 0 };
}
