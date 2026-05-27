import { setGhostMode } from "../../changePlayerState/ghost";
import { COLORS, sendErrorMessage, sendBlueMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { enableDebris } from "../../debris/enableDebris";
import {
  enableCutPenalty,
  enableSoftCutPenalty,
} from "../../detectCut/enableCutPenalty";
import { log } from "../../discord/logger";
import { enableDamage } from "../../speed/crashWallDetector";
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
  DAMAGE = "damage",
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
  let boolean = args[1]?.toLowerCase();

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
    system !== ToggleableSystems.DAMAGE &&
    system !== ToggleableSystems.SOFT_CUT_PENALTY
  ) {
    room.sendAnnouncement(`System "${args[0]}" does not exist.`, byPlayer.id, COLORS.RED);
    room.sendAnnouncement(
      `Try "slipstream", "tyres", "gas", "ghost", "rr", "tyres_blowout", "ers", "cut_penalty", "debris", "damage", "soft_cut_penalty" or "ers_penalty".`,
      byPlayer.id, COLORS.YELLOW
    );
    return;
  }

  if (boolean !== "on" && boolean !== "off") {
    room.sendAnnouncement(
      `Correct use: !enable [system] [on|off]`,
      byPlayer.id,
      COLORS.YELLOW
    );
    return;
  }

  if (system === ToggleableSystems.SLIPSTREAM) {
    if (boolean === "off") {
      log(`Slipstream mode disabled by ${byPlayer.name}`);
      room.sendAnnouncement("Slipstream disabled!", byPlayer.id, COLORS.GREEN);
      enableSlipstream(false);
    } else {
      log(`Slipstream mode enabled by ${byPlayer.name}`);
      room.sendAnnouncement("Slipstream enabled!", byPlayer.id, COLORS.GREEN);
      enableSlipstream(true);
    }
  } else if (system === ToggleableSystems.TYRES) {
    if (boolean === "off") {
      log(`Tyres mode disabled by ${byPlayer.name}`);
      room.sendAnnouncement("Tyres disabled!", byPlayer.id, COLORS.GREEN);
      enableTyres(false);
    } else {
      log(`Tyres mode enabled by ${byPlayer.name}`);
      room.sendAnnouncement("Tyres enabled!", byPlayer.id, COLORS.GREEN);
      enableTyres(true);
    }
  } else if (system === ToggleableSystems.GAS) {
    if (boolean === "off") {
      log(`Gas mode disabled by ${byPlayer.name}`);
      room.sendAnnouncement("Gas disabled!", byPlayer.id, COLORS.GREEN);
      enableGas(false);
    } else {
      log(`Gas mode enabled by ${byPlayer.name}`);
      room.sendAnnouncement("Gas enabled!", byPlayer.id, COLORS.GREEN);
      enableGas(true);
    }
  } else if (system === ToggleableSystems.GHOST) {
    if (boolean === "off") {
      setGhostMode(room, false);
    } else {
      setGhostMode(room, true);
    }
  } else if (system === ToggleableSystems.RR) {
    if (boolean === "off") {
      handleRREnabledCommand(undefined, ["off"], room);
      sendBlueMessage(room, MESSAGES.RR_DISABLED());
    } else {
      handleRREnabledCommand(undefined, ["on"], room);
      sendBlueMessage(room, MESSAGES.RR_ENABLED());
    }
  } else if (system === ToggleableSystems.TYRES_BLOWOUT) {
    if (boolean === "off") {
      log(`Tyre puncture mode disabled by ${byPlayer.name}`);
      sendBlueMessage(room, MESSAGES.TYRE_PUNCTURE_DISABLED(), byPlayer.id);
      setBlowoutTyresActivated(false);
    } else {
      log(`Tyre puncture mode enabled by ${byPlayer.name}`);
      sendBlueMessage(room, MESSAGES.TYRE_PUNCTURE_ENABLED(), byPlayer.id);
      setBlowoutTyresActivated(true);
    }
  } else if (system === ToggleableSystems.ERS) {
    if (boolean === "off") {
      log(`Ers mode disabled by ${byPlayer.name}`);
      room.sendAnnouncement("Ers disabled!", byPlayer.id, COLORS.GREEN);
      enableErs(false);
    } else {
      log(`Ers mode enabled by ${byPlayer.name}`);
      room.sendAnnouncement("Ers enabled!", byPlayer.id, COLORS.GREEN);
      enableErs(true);
    }
  } else if (system === ToggleableSystems.ERS_PENALTY) {
    if (boolean === "off") {
      log(`Ers penalty mode disabled by ${byPlayer.name}`);
      room.sendAnnouncement("Ers penalty disabled!", byPlayer.id, COLORS.GREEN);
      enableErsPenalty(false);
    } else {
      log(`Ers penalty mode enabled by ${byPlayer.name}`);
      room.sendAnnouncement("Ers penalty enabled!", byPlayer.id, COLORS.GREEN);
      enableErsPenalty(true);
    }
  } else if (system === ToggleableSystems.CUT_PENALTY) {
    if (boolean === "off") {
      log(`Cut penalty mode disabled by ${byPlayer.name}`);
      room.sendAnnouncement("Cut penalty disabled!", byPlayer.id, COLORS.GREEN);
      enableCutPenalty(false);
    } else {
      log(`Cut penalty mode enabled by ${byPlayer.name}`);
      room.sendAnnouncement("Cut penalty enabled!", byPlayer.id, COLORS.GREEN);
      enableCutPenalty(true);
    }
  } else if (system === ToggleableSystems.DEBRIS) {
    if (boolean === "off") {
      log(`Debris mode disabled by ${byPlayer.name}`);
      room.sendAnnouncement("Debris disabled!", byPlayer.id, COLORS.GREEN);
      enableDebris(false);
    } else {
      log(`Debris mode enabled by ${byPlayer.name}`);
      room.sendAnnouncement("Debris enabled!", byPlayer.id, COLORS.GREEN);
      enableDebris(true);
    }
  } else if (system === ToggleableSystems.DAMAGE) {
    if (boolean === "off") {
      log(`Damage mode disabled by ${byPlayer.name}`);
      enableDamage(false);
      sendBlueMessage(room, MESSAGES.DAMAGE_DISABLED(), byPlayer.id);
    } else {
      log(`Damage mode enabled by ${byPlayer.name}`);
      enableDamage(true);
      sendBlueMessage(room, MESSAGES.DAMAGE_ENABLED(), byPlayer.id);
    }
  } else if (system === ToggleableSystems.SOFT_CUT_PENALTY) {
    if (boolean === "off") {
      log(`Soft cut penalty mode disabled by ${byPlayer.name}`);
      room.sendAnnouncement("Soft cut penalty disabled!", byPlayer.id, COLORS.GREEN);
      enableSoftCutPenalty(false, room);
    } else {
      log(`Soft cut penalty mode enabled by ${byPlayer.name}`);
      room.sendAnnouncement("Soft cut penalty enabled!", byPlayer.id, COLORS.GREEN);
      enableSoftCutPenalty(true, room);
    }
  }
}
