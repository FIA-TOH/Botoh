import { Circuit } from "../../circuits/Circuit";
import { sendErrorMessage } from "../chat/chat";
import { handleChangeMap, CIRCUITS, currentMapIndex } from "../zones/maps";
import { MESSAGES } from "../chat/messages";
import { Teams } from "../changeGameState/teams";
import { log } from "../discord/logger";
import { loadCutSegmentsFromCircuit } from "../detectCut/detectCut";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import {
  hydratePublicDriverCircuitStatsForRoom,
  syncPublicCircuitOnMapLoad,
} from "../public/publicCircuits";
import { isPublicWaitingMapIndex } from "../zones/maps";

export let ACTUAL_CIRCUIT: Circuit;

function getMapName(circuit: Circuit) {
  try {
    return JSON.parse(circuit.map)?.name;
  } catch {
    return null;
  }
}

function resolveLoadedCircuit(newStadiumName: string) {
  const currentCircuit = CIRCUITS[currentMapIndex];
  if (
    currentCircuit &&
    (
      currentCircuit.info.name === newStadiumName ||
      getMapName(currentCircuit) === newStadiumName
    )
  ) {
    return currentCircuit;
  }

  return CIRCUITS.find((circuit) => circuit.info.name === newStadiumName);
}

export function StadiumChange(room: RoomObject) {
  room.onStadiumChange = function (newStadiumName, byPlayer) {
    if (byPlayer !== null) {
      sendErrorMessage(room, MESSAGES.NO_MANUAL_MAPS(), byPlayer.id);
      handleChangeMap(0, room);
    }
    log("New circuit loaded: ", newStadiumName);

    let c = resolveLoadedCircuit(newStadiumName);
    if (c) {
      loadCutSegmentsFromCircuit(c);
      ACTUAL_CIRCUIT = c;
      if (!LEAGUE_MODE && !isPublicWaitingMapIndex()) {
        syncPublicCircuitOnMapLoad(c);
        hydratePublicDriverCircuitStatsForRoom(c.info.name, room);
      }
    }

    if (
      c &&
      c.info.Angle !== undefined &&
      c.info.AvatarColor !== undefined &&
      c.info.AvatarColor !== 0 &&
      c.info.MainColor
    ) {
      room.setTeamColors(
        Teams.RUNNERS,
        c.info.Angle,
        c.info.AvatarColor,
        c.info.MainColor
      );
    }
  };
}
