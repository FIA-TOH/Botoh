// startStopGameFlow.ts
import { log } from "../../discord/logger";
import { getPlayerAndDiscs } from "../../playerFeatures/getPlayerAndDiscs";
import { getRunningPlayers } from "../../utils";
import { changeGameStoppedNaturally } from "../gameStopeedNaturally";
import PublicGameFlow from "./publicGameFLow";
import { gameState, handleGameStateChange } from "../gameState";
let publicFlowActive = false;
let publicFlowController: Promise<void> | null = null;
let cancelToken = { cancelled: false };

export function stopPublicFlow(room: RoomObject) {
  if (!publicFlowActive) return;

  cancelToken.cancelled = true; // dispara cancelamento
  log("⚠️ Public Flow finished.");

  // não precisa chamar stopGame aqui
}

export function startPublicFlow(room: RoomObject) {
  // sempre cria novo token e flow
  cancelToken = { cancelled: false };
  publicFlowActive = true;

  publicFlowController = (async () => {
    try {
      await PublicGameFlow(room, cancelToken);
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
