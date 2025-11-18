import { Circuit, CutSegment } from "../../circuits/Circuit";
import {
  generalGameMode,
  GeneralGameMode,
} from "../changeGameState/changeGameModes";
import { sendAlertMessage } from "../chat/chat";
import { MESSAGES } from "../chat/messages";
import { log } from "../discord/logger";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { getTimestamp } from "../utils";
import { applyCutPenalty } from "./applyCutPenalty";

const SEGMENT_CUT_COLOUR = "696969";
const DEFAULT_PENALTY_PUBLIC = 5;
const DEFAULT_PENALTY_LEAGUE = 2;

function decidePenalty(seg: any) {
  const PENALTY =
    LEAGUE_MODE && generalGameMode === GeneralGameMode.GENERAL_RACE
      ? DEFAULT_PENALTY_LEAGUE
      : seg.penalty ?? DEFAULT_PENALTY_PUBLIC;

  return PENALTY;
}

let cutSegments: CutSegment[] = [];
const playerLastSegment: Map<number, Set<number>> = new Map();
export function loadCutSegmentsFromCircuit(circuit: Circuit) {
  cutSegments = [];
  playerLastSegment.clear();

  const mapJson = JSON.parse(circuit.map);

  if (circuit.info.CutDetectSegments?.length) {
    cutSegments = circuit.info.CutDetectSegments.map(
      (seg: any, index: number) => ({
        index,
        penalty: decidePenalty(seg),
        v0: [seg.v0[0], seg.v0[1]],
        v1: [seg.v1[0], seg.v1[1]],
      })
    );
  }

  if (cutSegments.length === 0 && mapJson?.segments && mapJson?.vertexes) {
    cutSegments = mapJson.segments
      .map((seg: any, index: number) => {
        if (seg.color?.toLowerCase() !== SEGMENT_CUT_COLOUR) return null;
        const v0 = mapJson.vertexes[seg.v0];
        const v1 = mapJson.vertexes[seg.v1];
        if (!v0 || !v1) return null;
        return {
          index,
          penalty: decidePenalty(seg),
          v0: [v0.x, v0.y] as [number, number],
          v1: [v1.x, v1.y] as [number, number],
        };
      })
      .filter(Boolean) as CutSegment[];
  }
}

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
  let param = lenSq !== 0 ? dot / lenSq : -1;

  let xx: number, yy: number;
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

export function detectCut(
  pad: { p: PlayerObject; disc: { x: number; y: number; radius: number } },
  room: RoomObject
) {
  if (!pad.disc) return;

  const playerId = pad.p.id;
  if (!playerLastSegment.has(playerId))
    playerLastSegment.set(playerId, new Set());
  const lastSet = playerLastSegment.get(playerId)!;

  for (const seg of cutSegments) {
    const dist = pointToSegmentDistance(
      pad.disc.x,
      pad.disc.y,
      seg.v0[0],
      seg.v0[1],
      seg.v1[0],
      seg.v1[1]
    );

    if (dist < pad.disc.radius && !lastSet.has(seg.index)) {
      let realPeanlty = decidePenalty(seg);
      if (
        room.getScores().time < 30 &&
        generalGameMode === GeneralGameMode.GENERAL_RACE
      ) {
        realPeanlty = decidePenalty(seg) / 2;
      }
      // sendDiscordCutTrack(
      //   `${pad.p.name} cutted the track at ${getTimestamp()} -$ ${
      //     ACTUAL_CIRCUIT.info.name
      //   }`
      // );
      log(`${pad.p.name} cutted the track at ${getTimestamp()}`);
      sendAlertMessage(room, MESSAGES.CUTTED_TRACK(realPeanlty || 5), pad.p.id);

      lastSet.add(seg.index);
      applyCutPenalty(pad, realPeanlty || 5, room);
    }

    if (dist >= pad.disc.radius && lastSet.has(seg.index)) {
      lastSet.delete(seg.index);
    }
  }
}
