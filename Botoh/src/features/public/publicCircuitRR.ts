import { Circuit } from "../../circuits/Circuit";
import {
  clearRRPosition,
  setRRPosition,
} from "../commands/adminThings/rrPositionState";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { isPublicBackendOnline } from "./publicServiceStatus";
import {
  getPublicCircuit,
  updatePublicCircuitRRPosition,
} from "./publicCircuitRepository";

function isPublicCircuitRREnabled() {
  return !LEAGUE_MODE && isPublicBackendOnline();
}

export async function applyPublicCircuitRRPosition(circuit: Circuit) {
  if (!isPublicCircuitRREnabled() || !circuit.info?.name) return;

  const publicCircuit = await getPublicCircuit(circuit.info.name);
  const x = publicCircuit?.rr_position_x;
  const y = publicCircuit?.rr_position_y;

  if (typeof x === "number" && typeof y === "number") {
    setRRPosition(x, y);
    return;
  }

  clearRRPosition();
}

export function savePublicCircuitRRPosition(trackName: string, x: number, y: number) {
  if (!isPublicCircuitRREnabled() || !trackName) return;

  updatePublicCircuitRRPosition({ trackName, x, y }).catch((error) => {
    console.error("[publicCircuitRR] failed to save public RR position:", error);
  });
}
