import { getPlayerAndDiscs } from "../playerFeatures/getPlayerAndDiscs";
import { usedDebrisDiscs } from "./chooseOneDebris";

const debrisTouchState: Record<number, Set<number>> = {};

export function clearDebrisTouchState() {
  for (const key in debrisTouchState) {
    debrisTouchState[key].clear();
  }
}

export function updateDebrisTouch(room: RoomObject) {
  if (usedDebrisDiscs.length === 0) return;

  const playersAndDiscs = getPlayerAndDiscs(room);

  for (const debrisIndex of usedDebrisDiscs) {
    const debrisDisc = room.getDiscProperties(debrisIndex);

    if (!debrisDisc) {
      console.warn(`[DebrisTouch] Disc index ${debrisIndex} does not exist.`);
      continue;
    }
    const debrisRadius = debrisDisc.radius ?? 10;

    let touchSet = debrisTouchState[debrisIndex];
    if (!touchSet) {
      touchSet = new Set();
      debrisTouchState[debrisIndex] = touchSet;
    }

    for (const { p, disc } of playersAndDiscs) {
      if (!disc) continue;
      const playerRadius = disc.radius ?? 15;

      const dx = debrisDisc.x - disc.x;
      const dy = debrisDisc.y - disc.y;

      const dist = Math.sqrt(dx * dx + dy * dy);
      const touching = dist <= debrisRadius + playerRadius;

      const touchingBefore = touchSet.has(p.id);

      if (touching && !touchingBefore) {
        touchSet.add(p.id);
      }

      //   if (!touching && touchingBefore) {
      //     touchSet.delete(p.id);
      //   }
    }
  }
}
