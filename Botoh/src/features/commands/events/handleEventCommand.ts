import { setGhostMode } from "../../changePlayerState/ghost";
import { COLORS, sendErrorMessage } from "../../chat/chat";
import { getPlayerLanguage, MESSAGES } from "../../chat/messages";
import { getGameState } from "../../changeGameState/gameState";
import { enableDebris } from "../../debris/enableDebris";
import {
  enableCutPenalty,
  enableSoftCutPenalty,
  setZeroRaceCutSpeedPenaltyEnabled,
} from "../../detectCut/enableCutPenalty";
import { log } from "../../discord/logger";
import { enableCrashWallSlowdown, enableDamage } from "../../speed/crashWallDetector";
import { enableErs, enableErsPenalty } from "../../speed/fuel&Ers/ers";
import { enableGas, enableSlipstream } from "../../speed/handleSlipstream";
import { setBlowoutTyresActivated } from "../../tires&pits/tireBlowManager";
import {
  enableTyres,
  setRaceTyresInQualyEnabled,
} from "../../tires&pits/tires";
import { setScuderiaAvatar } from "../../scuderias/scuderiaAvatar";
import { setScuderiaDevelopmentEnabled } from "../../scuderias/scuderiaDevelopment";
import { setTeamCircuitBoxesEnabled } from "../../teamBoxes/teamCircuitBoxes";
import { handleSafetyCommand } from "../flagsAndVSC/handleSafetyCommand";
import { setBlueFlagsEnabled } from "../flagsAndVSC/blueFlags";
import { handlePresentationLapCommand } from "../gameState/handlePresentationLapCommand";
import { handleRModeCommand } from "../gameMode/race/handleRModeCommand";
import { setSandbagMode } from "../gameMode/battleRoyale.ts/handleSandbag";
import { handlePitCommand } from "../adminThings/handlePitCommand";
import { setManageTyresEnabled } from "../adminThings/handleManageTyresCommand";
import { handleRREnabledCommand } from "../adminThings/handleRREnabledCommand";
import { changeLaps } from "../adminThings/handleChangeLaps";
import { setMinimumPitStops } from "../tyres/handleSetMinimumPit";
import { setTyreWearEnabled } from "../../tires&pits/handleTireWear";
import {
  clearManualTeamSelections,
  setTeamCommandEnabled,
} from "../scuderia/handleSetScuderia";

type EventConfig = {
  name: string;
  apply: (room: RoomObject, byPlayer: PlayerObject) => void;
};

const EVENT_CONFIGS: Record<string, EventConfig> = {
  tortuga: {
    name: "Tortuga",
    apply: applyTortugaEvent,
  },
  shiryu_1: {
    name: "Shiryu 1",
    apply: applyShiryuOneEvent,
  },
  shiryu_2: {
    name: "Shiryu 2",
    apply: applyShiryuTwoEvent,
  },
  shiryu_3: {
    name: "Shiryu 3",
    apply: applyShiryuThreeEvent,
  },
};

export function handleEventCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject,
) {
  if (!byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.ADMIN_ONLY(), byPlayer.id);
    return;
  }

  if (getGameState() === "running") {
    sendErrorMessage(room, MESSAGES.ALREADY_STARTED(), byPlayer.id);
    return;
  }

  const eventName = args[0]?.toLowerCase();
  if (!eventName) {
    sendErrorMessage(
      room,
      MESSAGES.EVENT_MISSING_ARGUMENT(getAvailableEvents()),
      byPlayer.id,
    );
    return;
  }

  const eventConfig = EVENT_CONFIGS[eventName];
  if (!eventConfig) {
    sendErrorMessage(
      room,
      MESSAGES.EVENT_INVALID_ARGUMENT(eventName, getAvailableEvents()),
      byPlayer.id,
    );
    return;
  }

  eventConfig.apply(room, byPlayer);
  clearManualTeamSelections(room);

  const message = MESSAGES.EVENT_SUCCESS(eventConfig.name);
  const playerLang = getPlayerLanguage(byPlayer.id);
  room.sendAnnouncement(
    message[playerLang as keyof typeof message],
    byPlayer.id,
    COLORS.GREEN,
    "bold",
  );
}

function getAvailableEvents(): string {
  return Object.keys(EVENT_CONFIGS).join(", ");
}

function applyTortugaEvent(room: RoomObject, byPlayer: PlayerObject) {
  log(`Tortuga event configuration applied by ${byPlayer.name}`);
  applyAllSystemsOff(room, byPlayer);
  enableCutPenalty(true);
  setZeroRaceCutSpeedPenaltyEnabled(false);
  setSandbagMode(true, room);
  handleRModeCommand(byPlayer, [], room);
}

function applyShiryuOneEvent(room: RoomObject, byPlayer: PlayerObject) {
  log(`Shiryu 1 event configuration applied by ${byPlayer.name}`);
  applyAllSystemsOff(room, byPlayer);
  setBlueFlagsEnabled(false);
  handleRModeCommand(byPlayer, [], room);
  changeLaps("25", undefined, room);
}

function applyShiryuTwoEvent(room: RoomObject, byPlayer: PlayerObject) {
  log(`Shiryu 2 event configuration applied by ${byPlayer.name}`);
  applyAllSystemsOff(room, byPlayer);
  enableSlipstream(true);
  enableTyres(true);
  enableErs(true);
  enableErsPenalty(true);
  setTyreWearEnabled(false);
  handleRModeCommand(byPlayer, [], room);
  changeLaps("8", undefined, room);
}

function applyShiryuThreeEvent(room: RoomObject, byPlayer: PlayerObject) {
  log(`Shiryu 3 event configuration applied by ${byPlayer.name}`);
  applyAllSystemsOff(room, byPlayer);
  enableSlipstream(true);
  handleRModeCommand(byPlayer, [], room);
  changeLaps("12", undefined, room);
  setMinimumPitStops(1);
}

function applyAllSystemsOff(room: RoomObject, byPlayer: PlayerObject) {
  setMinimumPitStops(0);
  handleSafetyCommand(byPlayer, ["off"], room);
  enableSlipstream(false);
  enableTyres(false);
  setRaceTyresInQualyEnabled(false);
  setTyreWearEnabled(false);
  enableGas(false);
  setGhostMode(room, false);
  handlePresentationLapCommand(undefined, ["off"], room);
  setBlowoutTyresActivated(false);
  enableErs(false);
  enableErsPenalty(false);
  enableCutPenalty(false);
  setZeroRaceCutSpeedPenaltyEnabled(false);
  enableSoftCutPenalty(false, room);
  enableDebris(false);
  enableDamage(false);
  enableCrashWallSlowdown(false);
  setSandbagMode(false, room);
  handlePitCommand(byPlayer, ["old"], room);
  setManageTyresEnabled(false);
  handleRREnabledCommand(byPlayer, ["off"], room);
  setScuderiaAvatar(false);
  setScuderiaDevelopmentEnabled(false);
  setTeamCircuitBoxesEnabled(false);
  setTeamCommandEnabled(false);
  setBlueFlagsEnabled(false);
}
