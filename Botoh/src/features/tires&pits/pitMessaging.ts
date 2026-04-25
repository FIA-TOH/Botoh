import { handleAvatar, Situacions } from "../changePlayerState/handleAvatar";
import { sendSmallChatMessage } from "../chat/chat";
import { MESSAGES } from "../chat/messages";
import { PitResult } from "./pitStopFunctions";
import { isPitNewSystemEnabled } from "./newPitSystem/newPitManager";

type TyreStatus = "⬜" | "🟨" | "🟥" | "🟩";
type PitStepKind = "changing" | "error" | "success";

export type PitStep = {
  threshold: number;
  kind: PitStepKind;
  statuses: [TyreStatus, TyreStatus, TyreStatus, TyreStatus]; // [FLT, FRT, BLT, BRT]
};

function cloneStatuses(
  s: TyreStatus[]
): [TyreStatus, TyreStatus, TyreStatus, TyreStatus] {
  return [s[0], s[1], s[2], s[3]];
}

export function emitPitMessage(
  room: RoomObject,
  kind: PitStepKind,
  statuses: [TyreStatus, TyreStatus, TyreStatus, TyreStatus],
  player: PlayerObject
) {
  const [flt, frt, blt, brt] = statuses;
  if (kind === "error") {
    sendSmallChatMessage(
      room,
      MESSAGES.TYRE_STEP_ERROR(flt, frt, blt, brt),
      player.id
    );
  } else if (kind === "success") {
    sendSmallChatMessage(
      room,
      MESSAGES.TYRE_STEP_SUCCESS(flt, frt, blt, brt),
      player.id
    );
  } else {
    sendSmallChatMessage(
      room,
      MESSAGES.TYRE_STEP_CHANGING(flt, frt, blt, brt),
      player.id
    );
  }
}
export function buildPitSteps(pit: PitResult | undefined): PitStep[] {
  if (!pit) return [];

  const times = pit.perTyreTimes;
  const total = pit.totalTime;
  const errSet = new Set(pit.tyres);

  const isPitNew = isPitNewSystemEnabled();
  const errorThreshold = isPitNew ? 5.0 : 3.0;
  
  const shouldShowError = total > errorThreshold;

  const steps: PitStep[] = [];
  const s: TyreStatus[] = ["⬜", "⬜", "⬜", "⬜"];
  s[0] = "🟨";

  let elapsed = 0;

  for (let i = 0; i < 4; i++) {
    const t = times[i];
    const startRemaining = total - elapsed;
    const last = i === 3;

    if (errSet.has(i) && shouldShowError) {
      const third = t / 3;

      steps.push({
        threshold: startRemaining - third,
        kind: "error",
        statuses: cloneStatuses({ ...s, [i]: "🟥" }),
      });
      steps.push({
        threshold: startRemaining - 2 * third,
        kind: "changing",
        statuses: cloneStatuses({ ...s, [i]: "🟨" }),
      });
    }

    elapsed += t;
    const remaining = total - elapsed;
    const ss = cloneStatuses(s);
    ss[i] = "🟩";
    if (!last) ss[i + 1] = "🟨";

    steps.push({
      threshold: remaining,
      kind: last ? "success" : "changing",
      statuses: ss,
    });

    s[0] = ss[0];
    s[1] = ss[1];
    s[2] = ss[2];
    s[3] = ss[3];
  }

  const lastStep = steps[steps.length - 1];
  if (lastStep.kind !== "success" || lastStep.threshold > 0) {
    steps.push({
      threshold: 0,
      kind: "success",
      statuses: ["🟩", "🟩", "🟩", "🟩"],
    });
  }

  return steps.sort((a, b) => b.threshold - a.threshold);
}
