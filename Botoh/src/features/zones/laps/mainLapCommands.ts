import { CircuitInfo } from "../../../circuits/Circuit";
import { playerList } from "../../changePlayerState/playerList";
import { sendErrorMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { presentationLap } from "../../commands/gameState/handlePresentationLapCommand";
import { getRunningPlayers } from "../../utils";
import { CIRCUITS, currentMapIndex } from "../maps";
import { handleLapCompletion } from "./handleLapCompletion";
import { notifyLapStart } from "./utils/annoucements/notifyLapStart";
import { checkTrollingOrPunish } from "./utils/checkTrollingOrPunish";
import { isInValidLapZone } from "./utils/isInValidLapZone";
import { updateLapTimers } from "./utils/updateLapTimers";

export function mainLapCommand(
  playersAndDiscs: { p: PlayerObject; disc: DiscPropertiesObject }[],
  room: RoomObject
) {
  if (presentationLap) return;

  const players = getRunningPlayers(playersAndDiscs);
  const circuit = CIRCUITS[currentMapIndex].info;
  const hasSector = !!circuit.sectorOne;

  players.forEach((pad) =>
    handlePlayerLap(pad, room, circuit, hasSector, players)
  );
}

function handlePlayerLap(
  pad: { p: PlayerObject; disc: DiscPropertiesObject },
  room: RoomObject,
  circuit: CircuitInfo,
  hasSector: boolean,
  players: { p: PlayerObject; disc: DiscPropertiesObject }[]
) {
  const p = pad.p;
  const playerData = playerList[p.id];

  updateLapTimers(playerData);

  if (!isInValidLapZone(pad, room)) {
    playerData.lapChanged = false;
    return;
  }

  if (room.getScores().time === 0) {
    sendErrorMessage(room, MESSAGES.EARLY_LAP_ERROR(), p.id);
  }

  if (playerData.lapChanged) return;

  notifyLapStart(room, p, playerData);

  if (checkTrollingOrPunish(pad, circuit, room)) return;

  const completedLap = !hasSector || playerData.currentSector === 3;
  if (!completedLap) return;

  handleLapCompletion(pad, room, hasSector, players);
}
