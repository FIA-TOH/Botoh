import { sendErrorMessage, sendChatMessage, sendYellowMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { changeVSC, vsc } from "../../safetyCar/vsc";
import { RaceControlState, setNeutralizationState } from "./raceControl";

export function handleVSCCommand(
  byPlayer?: PlayerObject,
  args?: string[],
  room?: RoomObject
) {
  if (!room) {
    return;
  }
  if (byPlayer && !byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }

  changeVSC();
  
  if (vsc) {
    setNeutralizationState(RaceControlState.VirtualSafetyCar);
    sendYellowMessage(room, MESSAGES.VSC_DEPLOYED());
  } else {
    setNeutralizationState(null);
    sendChatMessage(room, MESSAGES.VSC_NOT_ACTIVE());
  }
}
