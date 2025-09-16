import {
  BALL_MAX_SPEED,
  DEAD_ZONE_BALL,
} from "../commands/camera/handleCameraProperties";
import { getPlayerAndDiscs } from "../playerFeatures/getPlayerAndDiscs";
import { ACTUAL_CIRCUIT } from "../roomFeatures/stadiumChange";
import { getRunningPlayers } from "../utils";
import {
  followPlayerId,
  setCameraAuto,
  setFollowPlayer,
  updateFollowPlayerId,
} from "./cameraFollow";
import { updateEyeLook } from "./updateEyeLook";

let tickCounterBall = 0;
let tickCounterEyes = 0;
let lastHeading = { x: 1, y: 0 };
let ballPhysicsInitialized = false;

const EYE_LEFT_ID = 84;
const EYE_RIGHT_ID = 85;
const PUPIL_LEFT_ID = 86;
const PUPIL_RIGHT_ID = 87;

export function isFollowPlayerValid(
  room: RoomObject,
  id: number | null
): boolean {
  if (id == null) return false;
  const playersAndDiscs = getPlayerAndDiscs(room);
  const runningPlayers = getRunningPlayers(playersAndDiscs);
  return runningPlayers.some((rp) => rp.p.id === id);
}

function setBallPhisic(room: RoomObject) {
  room.setDiscProperties(0, {
    cMask: 0,
    cGroup: 0,
    radius: 0,
  });
}

export function setBallPosition(room: RoomObject) {
  const scores = room.getScores();
  if (!scores) return;

  if (scores.time <= 0) {
    ballPhysicsInitialized = false;
    return;
  }

  // === Inicialização da física da bola ===
  if (!ballPhysicsInitialized) {
    room.setDiscProperties(0, { cMask: 0, cGroup: 0, radius: 0 });
    ballPhysicsInitialized = true;

    setCameraAuto();

    const playersAndDiscs = getPlayerAndDiscs(room);
    const runningPlayers = getRunningPlayers(playersAndDiscs);
    if (runningPlayers.length > 0) {
      setFollowPlayer(runningPlayers[0].p.id, true);
    }
  }

  // === Atualização da bola a cada 15 ticks ===
  tickCounterBall++;
  if (tickCounterBall >= 15) {
    tickCounterBall = 0;
    updateFollowPlayerId(room);

    if (followPlayerId == null) return;

    const ball = room.getDiscProperties(0);
    if (!ball) return;

    const playersAndDiscs = getPlayerAndDiscs(room);
    const runningPlayers = getRunningPlayers(playersAndDiscs);
    const pDisc = room.getPlayerDiscProperties(followPlayerId);
    const runningPlayerObj = runningPlayers.find(
      (rp) => rp.p.id === followPlayerId
    )?.p;

    if (!runningPlayerObj && !pDisc) return;

    const px = pDisc?.x ?? runningPlayerObj?.position?.x;
    const py = pDisc?.y ?? runningPlayerObj?.position?.y;
    const pvx = pDisc?.xspeed ?? 0;
    const pvy = pDisc?.yspeed ?? 0;
    if (px == null || py == null) return;

    const pSpeedMag = Math.hypot(pvx, pvy);
    let hx = lastHeading.x,
      hy = lastHeading.y;
    if (pSpeedMag > 0.01) {
      hx = pvx / pSpeedMag;
      hy = pvy / pSpeedMag;
      lastHeading = { x: hx, y: hy };
    }

    const followOffset = 16;
    const ox = -hx * followOffset;
    const oy = -hy * followOffset;
    const leadTime = 0.2;
    const tx = px + pvx * leadTime + ox;
    const ty = py + pvy * leadTime + oy;

    const ex = tx - ball.x;
    const ey = ty - ball.y;
    const dist = Math.hypot(ex, ey);

    if (dist < DEAD_ZONE_BALL) {
      const stickGain = 0.95;
      room.setDiscProperties(0, {
        xspeed: pvx * stickGain,
        yspeed: pvy * stickGain,
      });
    } else {
      const VMAX = BALL_MAX_SPEED;
      const ARRIVAL_R = 120;
      const vDesiredMag = VMAX * (1 - Math.exp(-dist / ARRIVAL_R));
      const dirx = ex / dist;
      const diry = ey / dist;
      const vdx = dirx * vDesiredMag;
      const vdy = diry * vDesiredMag;
      const lerp = 0.55;
      let nvx = ball.xspeed + (vdx - ball.xspeed) * lerp;
      let nvy = ball.yspeed + (vdy - ball.yspeed) * lerp;
      const nmag = Math.hypot(nvx, nvy);
      if (nmag > VMAX) {
        nvx = (nvx / nmag) * VMAX;
        nvy = (nvy / nmag) * VMAX;
      }
      room.setDiscProperties(0, { xspeed: nvx, yspeed: nvy });
    }
  }

  // === Atualização dos olhos a cada 5 ticks ===
  tickCounterEyes++;
  if (tickCounterEyes >= 10) {
    tickCounterEyes = 0;

    if (followPlayerId == null) return;

    const pDisc = room.getPlayerDiscProperties(followPlayerId);
    const runningPlayers = getRunningPlayers(getPlayerAndDiscs(room));
    const runningPlayerObj = runningPlayers.find(
      (rp) => rp.p.id === followPlayerId
    )?.p;
    if (!runningPlayerObj && !pDisc) return;

    const px = pDisc?.x ?? runningPlayerObj?.position?.x;
    const py = pDisc?.y ?? runningPlayerObj?.position?.y;
    if (px == null || py == null) return;

    if (ACTUAL_CIRCUIT.info.name === "Las Vegas Strip Circuit - By Ximb") {
      updateEyeLook(room, EYE_LEFT_ID, PUPIL_LEFT_ID, px, py);
      updateEyeLook(room, EYE_RIGHT_ID, PUPIL_RIGHT_ID, px, py);
    }
  }
}
