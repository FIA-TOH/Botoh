import { teleportDisc } from "../cameraAndBall/teleportDisc";
import { log } from "../discord/logger";
import { ACTUAL_CIRCUIT } from "../roomFeatures/stadiumChange";
import { resetDebrisUsedList } from "./chooseOneDebris";

export function clearDebris(room: RoomObject) {
  if (ACTUAL_CIRCUIT.info.haveDebris === false) {
    return;
  }
  const mapJson = JSON.parse(ACTUAL_CIRCUIT.map) as { discs: any[] };

  const debrisList = mapJson.discs
    .map((disc, jsonIndex) => ({
      disc,
      jsonIndex,
      realIndex: jsonIndex + 1,
    }))
    .filter((d) => d.disc.color?.toLowerCase() === "292929");

  if (debrisList.length === 0) {
    log("[Debris] No debris discs (292929) found to restore.");
    return;
  }

  for (const debris of debrisList) {
    const originalPos = {
      x: debris.disc.pos?.[0] ?? 0,
      y: debris.disc.pos?.[1] ?? 0,
    };

    teleportDisc(room, debris.realIndex, originalPos);

    log(
      `[Debris] Restored disc ${debris.realIndex} → original position (${originalPos.x}, ${originalPos.y})`
    );
  }

  resetDebrisUsedList();

  log("[Debris] All debris restored and used list cleared.");
}
