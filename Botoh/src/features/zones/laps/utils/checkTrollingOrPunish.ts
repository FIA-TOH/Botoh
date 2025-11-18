import { CircuitInfo } from "../../../../circuits/Circuit";
import { Teams } from "../../../changeGameState/teams";
import { sendErrorMessage } from "../../../chat/chat";
import { MESSAGES } from "../../../chat/messages";
import { CHECK_IF_TROLLING, checkIfTrolling } from "../../../utils";

export function checkTrollingOrPunish(
  pad: {
    p: PlayerObject;
    disc: DiscPropertiesObject;
  },
  circuit: CircuitInfo,
  room: RoomObject
) {
  if (
    CHECK_IF_TROLLING &&
    checkIfTrolling(pad, circuit.finishLine.passingDirection)
  ) {
    sendErrorMessage(room, MESSAGES.TROLLING_DETECTED(), pad.p.id);

    const hasSector = !!circuit.sectorOne;
    if (!hasSector) room.setPlayerTeam(pad.p.id, Teams.SPECTATORS);

    return true;
  }

  return false;
}
