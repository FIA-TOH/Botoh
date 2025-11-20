import { ACTUAL_CIRCUIT } from "../roomFeatures/stadiumChange";
import { teleportDisc } from "../cameraAndBall/teleportDisc";
import { log } from "../discord/logger";

export let usedDebrisDiscs: number[] = [];

export function resetDebrisUsedList() {
  usedDebrisDiscs = [];
}

export function chooseOneDebris(room: RoomObject, playerId: number) {
  const mapJson = JSON.parse(ACTUAL_CIRCUIT.map) as { discs: any[] };

  const debrisList: { disc: any; jsonIndex: number; realIndex: number }[] =
    mapJson.discs
      .map((disc, jsonIndex) => ({
        disc,
        jsonIndex,
        realIndex: jsonIndex + 1,
      }))
      .filter((d) => d.disc.color?.toLowerCase() === "292929");

  if (debrisList.length === 0) {
    log("[Debris] No 292929 debris colour found.");
    return;
  }

  const availableDisc = debrisList.find(
    (d) => !usedDebrisDiscs.includes(d.realIndex)
  );

  if (!availableDisc) {
    log("[Debris] All 292929 debris used.");
    return;
  }

  usedDebrisDiscs.push(availableDisc.realIndex);

  const player = room.getPlayer(playerId);
  if (!player) {
    log(`[Debris] Player ${playerId} does not exist.`);
    return;
  }

  const playerDisc = room.getPlayerDiscProperties(playerId);
  if (!playerDisc) {
    log("⚠️ Could not get player disc properties.");
    return;
  }

  teleportDisc(room, availableDisc.realIndex, playerDisc);
}
