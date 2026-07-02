import { COLORS, sendErrorMessage } from "../../chat/chat";
import { MESSAGES, getPlayerLanguage } from "../../chat/messages";
import { setGhostMode } from "../../changePlayerState/ghost";
import { getGameState } from "../../changeGameState/gameState";
import { enableDebris } from "../../debris/enableDebris";
import {
  enableCutPenalty,
  enableSoftCutPenalty,
  setZeroRaceCutSpeedPenaltyEnabled,
} from "../../detectCut/enableCutPenalty";
import { log } from "../../discord/logger";
import { enableDamage } from "../../speed/crashWallDetector";
import { enableErs, enableErsPenalty } from "../../speed/fuel&Ers/ers";
import { enableGas, enableSlipstream } from "../../speed/handleSlipstream";
import { setBlowoutTyresActivated } from "../../tires&pits/tireBlowManager";
import {
  enableTyres,
  setRaceTyresInQualyEnabled,
} from "../../tires&pits/tires";
import { handleSafetyCommand } from "../flagsAndVSC/handleSafetyCommand";
import { handleRModeCommand } from "../gameMode/race/handleRModeCommand";
import { handlePitCommand } from "./handlePitCommand";
import { setManageTyresEnabled } from "./handleManageTyresCommand";
import { handlePresentationLapCommand } from "../gameState/handlePresentationLapCommand";
import { handleRREnabledCommand } from "./handleRREnabledCommand";
import { setScuderiaAvatar } from "../../scuderias/scuderiaAvatar";
import { setTeamCircuitBoxesEnabled } from "../../teamBoxes/teamCircuitBoxes";
import {
  clearManualTeamSelections,
  setTeamCommandEnabled,
} from "../scuderia/handleSetScuderia";


export function handleConfigCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
    const gameState = getGameState();
    if (gameState === "running") {
      sendErrorMessage(room, MESSAGES.ALREADY_STARTED(), byPlayer.id);
      return;
    }
  if (!byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.ADMIN_ONLY(), byPlayer.id);
    return;
  }

  if (!args[0]) {
    sendErrorMessage(room, MESSAGES.CONFIG_MISSING_ARGUMENT(), byPlayer.id);
    return;
  }

  const configType = args[0].toLowerCase();
  if (configType === "team") {
    const shouldEnable = parseBooleanConfig(args[1]);
    if (shouldEnable === null) {
      sendErrorMessage(room, MESSAGES.TEAM_COMMAND_CONFIG_USAGE(), byPlayer.id);
      return;
    }

    setTeamCommandEnabled(shouldEnable);
    clearManualTeamSelections(room);
    const message = MESSAGES.TEAM_COMMAND_CONFIG_SUCCESS(shouldEnable);
    const playerLang = getPlayerLanguage(byPlayer.id);
    room.sendAnnouncement(
      message[playerLang as keyof typeof message],
      byPlayer.id,
      COLORS.GREEN,
      "bold"
    );
    return;
  }

  const validConfigs = ['ftoh', 'fh', 'haxbula', 'ftohpublic'];

  if (!validConfigs.includes(configType)) {
    sendErrorMessage(room, MESSAGES.CONFIG_INVALID_ARGUMENT(), byPlayer.id);
    return;
  }

  if (configType === 'ftoh') {
    applyFTOHConfig(room, byPlayer);
  } else if (configType === 'fh') {
    applyFHConfig(room, byPlayer);
  } else if (configType === 'haxbula') {
    applyHaxbulaConfig(room, byPlayer);
  } else if (configType === 'ftohpublic') {
    applyFTOHPublicConfig(room, byPlayer);
  }
  clearManualTeamSelections(room);

  const message = MESSAGES.CONFIG_SUCCESS(configType);
  const playerLang = getPlayerLanguage(byPlayer.id);
  room.sendAnnouncement(message[playerLang as keyof typeof message], byPlayer.id, COLORS.GREEN, "bold");
}

function parseBooleanConfig(value?: string): boolean | null {
  const normalizedValue = value?.toLowerCase();
  if (normalizedValue === "true" || normalizedValue === "on") return true;
  if (normalizedValue === "false" || normalizedValue === "off") return false;
  return null;
}

function applyFTOHConfig(room: RoomObject, byPlayer: PlayerObject) {
  log(`FTOH configuration applied by ${byPlayer.name}`);
  handleSafetyCommand(byPlayer, ["on"], room);
  handleRModeCommand(byPlayer, [], room);
  enableSlipstream(true);
  enableTyres(true);
  setRaceTyresInQualyEnabled(true);
  enableGas(false);
  setGhostMode(room, false);
  handlePresentationLapCommand(undefined, ["off"], room);
  setBlowoutTyresActivated(false);
  enableErs(true);
  enableErsPenalty(true);
  enableDebris(true);
  enableDamage("log");
  enableCutPenalty(true);
  setZeroRaceCutSpeedPenaltyEnabled(true);
  enableSoftCutPenalty(false, room);
  handlePitCommand(byPlayer, ["new"], room);
  setManageTyresEnabled(false);
  handleRREnabledCommand(byPlayer, ["off"], room);
  setScuderiaAvatar(true);
  setTeamCircuitBoxesEnabled(true);
  setTeamCommandEnabled(false);
}


export function applyFTOHPublicConfig(room: RoomObject, byPlayer: PlayerObject) {
  log(`FTOH Public configuration applied by ${byPlayer.name}`);
  handleSafetyCommand(byPlayer, ["off"], room);
  handleRModeCommand(byPlayer, [], room);
  enableSlipstream(true);
  enableTyres(false);
  setRaceTyresInQualyEnabled(false);
  enableGas(false);
  setGhostMode(room, false);
  handlePresentationLapCommand(undefined, ["off"], room);
  setBlowoutTyresActivated(false);
  enableErs(true);
  enableErsPenalty(true);
  enableCutPenalty(true);
  setZeroRaceCutSpeedPenaltyEnabled(false);
  enableDebris(false);
  enableDamage(false);
  enableSoftCutPenalty(false, room);
  handlePitCommand(byPlayer, ["old"], room);
  setManageTyresEnabled(false);
  handleRREnabledCommand(byPlayer, ["on"], room);
  setScuderiaAvatar(false);
  setTeamCircuitBoxesEnabled(false);
  setTeamCommandEnabled(true);
}

function applyFHConfig(room: RoomObject, byPlayer: PlayerObject) {
  log(`FH configuration applied by ${byPlayer.name}`);
  handleSafetyCommand(byPlayer, ["off"], room);
  handleRModeCommand(byPlayer, [], room);
  enableSlipstream(true);
  enableTyres(true);
  setRaceTyresInQualyEnabled(false);
  enableGas(false);
  setGhostMode(room, false);
  handlePresentationLapCommand(undefined, ["off"], room);
  setBlowoutTyresActivated(false);
  enableErs(false);
  enableErsPenalty(true);
  enableCutPenalty(true);
  setZeroRaceCutSpeedPenaltyEnabled(false);
  enableDebris(false);
  enableDamage(false);
  enableSoftCutPenalty(false, room);
  handlePitCommand(byPlayer, ["old"], room);
  setManageTyresEnabled(false);
  handleRREnabledCommand(byPlayer, ["on"], room);
  setScuderiaAvatar(false);
  setTeamCircuitBoxesEnabled(false);
  setTeamCommandEnabled(true);
}

function applyHaxbulaConfig(room: RoomObject, byPlayer: PlayerObject) {
  log(`Haxbula configuration applied by ${byPlayer.name}`);
  handleSafetyCommand(byPlayer, ["off"], room);
  handleRModeCommand(byPlayer, [], room);
  enableSlipstream(false);
  enableTyres(false);
  setRaceTyresInQualyEnabled(false);
  enableGas(false);
  setGhostMode(room, true);
  handlePresentationLapCommand(undefined, ["off"], room);
  setBlowoutTyresActivated(false);
  enableErs(false);
  enableErsPenalty(false);
  enableCutPenalty(false);
  setZeroRaceCutSpeedPenaltyEnabled(false);
  enableDebris(false);
  enableDamage(false);
  enableSoftCutPenalty(false, room);
  handlePitCommand(byPlayer, ["old"], room);
  setManageTyresEnabled(false);
  handleRREnabledCommand(byPlayer, ["on"], room);
  setScuderiaAvatar(false);
  setTeamCircuitBoxesEnabled(false);
  setTeamCommandEnabled(true);
}
