import { setGhostMode } from "../../changePlayerState/ghost";
import { sendErrorMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { enableDebris } from "../../debris/enableDebris";
import {
  enableCutPenalty,
  enableSoftCutPenalty,
} from "../../detectCut/enableCutPenalty";
import { log } from "../../discord/logger";
import { enableErs, enableErsPenalty } from "../../speed/fuel&Ers/ers";
import { enableGas, enableSlipstream } from "../../speed/handleSlipstream";
import { setBlowoutTyresActivated } from "../../tires&pits/tireBlowManager";
import { enableTyres } from "../../tires&pits/tires";
import { handleRREnabledCommand } from "./handleRREnabledCommand";

export enum ToggleableSystems {
  SLIPSTREAM = "slipstream",
  TYRES = "tyres",
  GAS = "gas",
  GHOST = "ghost",
  RR = "rr",
  TYRES_BLOWOUT = "tyres_blowout",
  ERS = "ers",
  ERS_PENALTY = "ers_penalty",
  CUT_PENALTY = "cut_penalty",
  DEBRIS = "debris",
  SOFT_CUT_PENALTY = "soft_cut_penalty",
}

export function handleToggleSystems(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (!byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }
  const system = args[0]?.toLowerCase();
  const boolean = args[1]?.toLowerCase();

  if (
    system !== ToggleableSystems.SLIPSTREAM &&
    system !== ToggleableSystems.TYRES &&
    system !== ToggleableSystems.GAS &&
    system !== ToggleableSystems.GHOST &&
    system !== ToggleableSystems.RR &&
    system !== ToggleableSystems.TYRES_BLOWOUT &&
    system !== ToggleableSystems.ERS &&
    system !== ToggleableSystems.ERS_PENALTY &&
    system !== ToggleableSystems.CUT_PENALTY &&
    system !== ToggleableSystems.DEBRIS &&
    system !== ToggleableSystems.SOFT_CUT_PENALTY
  ) {
    room.sendAnnouncement(`System "${args[0]}" does not exist.`, byPlayer.id);
    room.sendAnnouncement(
      `Try "slipstream", "tyres", "gas", "ghost", "rr", "tyres_blowout", "ers", "cut_penalty", "debris", "soft_cut_penalty" or "ers_penalty".`,
      byPlayer.id
    );
    return;
  }

  if (boolean !== "true" && boolean !== "false") {
    room.sendAnnouncement(
      `Correct use: !enable [system] [true|false]`,
      byPlayer.id
    );
    return;
  }

  if (system === ToggleableSystems.SLIPSTREAM) {
    if (boolean === "false") {
      log(`Slipstream mode disabled by ${byPlayer.name}`);
      room.sendAnnouncement("Slipstream disabled!", byPlayer.id);
      enableSlipstream(false);
    } else {
      log(`Slipstream mode enabled by ${byPlayer.name}`);
      room.sendAnnouncement("Slipstream enabled!");
      enableSlipstream(true);
    }
  } else if (system === ToggleableSystems.TYRES) {
    if (boolean === "false") {
      log(`Tyres mode disabled by ${byPlayer.name}`);
      room.sendAnnouncement("Tyres disabled!");
      enableTyres(false);
    } else {
      log(`Tyres mode enabled by ${byPlayer.name}`);
      room.sendAnnouncement("Tyres enabled!");
      enableTyres(true);
    }
  } else if (system === ToggleableSystems.GAS) {
    if (boolean === "false") {
      log(`Gas mode disabled by ${byPlayer.name}`);
      room.sendAnnouncement("Gas disabled!");
      enableGas(false);
    } else {
      log(`Gas mode enabled by ${byPlayer.name}`);
      room.sendAnnouncement("Gas enabled!");
      enableGas(true);
    }
  } else if (system === ToggleableSystems.GHOST) {
    if (boolean === "false") {
      setGhostMode(room, false);
    } else {
      setGhostMode(room, true);
    }
  } else if (system === ToggleableSystems.RR) {
    if (boolean === "false") {
      handleRREnabledCommand(undefined, ["false"], room);
    } else {
      handleRREnabledCommand(undefined, ["true"], room);
    }
  } else if (system === ToggleableSystems.TYRES_BLOWOUT) {
    if (boolean === "false") {
      log(`Tyres blowout mode disabled by ${byPlayer.name}`);
      room.sendAnnouncement("Tyres blowout disabled!");
      setBlowoutTyresActivated(false);
    } else {
      log(`Tyres blowout mode enabled by ${byPlayer.name}`);
      room.sendAnnouncement("Tyres blowout enabled!");
      setBlowoutTyresActivated(true);
    }
  } else if (system === ToggleableSystems.ERS) {
    if (boolean === "false") {
      log(`Ers mode disabled by ${byPlayer.name}`);
      room.sendAnnouncement("Ers disabled!");
      enableErs(false);
    } else {
      log(`Ers mode enabled by ${byPlayer.name}`);
      room.sendAnnouncement("Ers enabled!");
      enableErs(true);
    }
  } else if (system === ToggleableSystems.ERS_PENALTY) {
    if (boolean === "false") {
      log(`Ers penalty mode disabled by ${byPlayer.name}`);
      room.sendAnnouncement("Ers penalty disabled!");
      enableErsPenalty(false);
    } else {
      log(`Ers penalty mode enabled by ${byPlayer.name}`);
      room.sendAnnouncement("Ers penalty enabled!");
      enableErsPenalty(true);
    }
  } else if (system === ToggleableSystems.CUT_PENALTY) {
    if (boolean === "false") {
      log(`Cut penalty mode disabled by ${byPlayer.name}`);
      room.sendAnnouncement("Cut penalty disabled!");
      enableCutPenalty(false);
    } else {
      log(`Cut penalty mode enabled by ${byPlayer.name}`);
      room.sendAnnouncement("Cut penalty enabled!");
      enableCutPenalty(true);
    }
  } else if (system === ToggleableSystems.DEBRIS) {
    if (boolean === "false") {
      log(`Debris mode disabled by ${byPlayer.name}`);
      room.sendAnnouncement("Debris disabled!");
      enableDebris(false);
    } else {
      log(`Debris mode enabled by ${byPlayer.name}`);
      room.sendAnnouncement("Debris enabled!");
      enableDebris(true);
    }
  } else if (system === ToggleableSystems.SOFT_CUT_PENALTY) {
    if (boolean === "false") {
      log(`Soft cut penalty mode disabled by ${byPlayer.name}`);
      room.sendAnnouncement("Soft cut penalty disabled!");
      enableSoftCutPenalty(false, room);
    } else {
      log(`Soft cut penalty mode enabled by ${byPlayer.name}`);
      room.sendAnnouncement("Soft cut penalty enabled!");
      enableSoftCutPenalty(true, room);
    }
  }
}
