import { log } from "../../discord/logger";
import { getPlayerAndDiscs } from "../../playerFeatures/getPlayerAndDiscs";
import { getRunningPlayers } from "../../utils";
import PublicGameFlow from "./publicGameFLow";

let publicFlowActive = false;
let publicFlowController: Promise<void> | null = null;

export function stopPublicFlow(room: RoomObject) {
  if (!publicFlowActive) return;
  publicFlowActive = false;
  room.stopGame();
  log("⚠️ Public Flow finished.");
}

export function startPublicFlow(room: RoomObject) {
  publicFlowActive = true;

  publicFlowController = (async () => {
    try {
      await PublicGameFlow(room);
    } catch (err: any) {
      if (err.message === "Flow cancelled") {
        log("ℹ️ PublicGameFlow cancelado manualmente.");
      } else {
        log("❌ Error in PublicGameFlow:", err);
      }
    } finally {
      publicFlowActive = false;
      publicFlowController = null;
    }
  })();
}

export function checkRunningPlayers(room: RoomObject) {
  const playersAndDiscs = getPlayerAndDiscs(room);
  const runningPlayers = getRunningPlayers(playersAndDiscs);

  if (runningPlayers.length === 0) {
    stopPublicFlow(room);
  }
}
