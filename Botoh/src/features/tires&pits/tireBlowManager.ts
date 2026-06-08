import {
  gameMode,
  GameMode,
  GeneralGameMode,
  generalGameMode,
} from "../changeGameState/changeGameModes";
import { handleAvatar, Situacions } from "../changePlayerState/handleAvatar";
import { playerList } from "../changePlayerState/playerList";
import { sendAlertMessage, sendChatMessage } from "../chat/chat";
import { MESSAGES } from "../chat/messages";
import { isManageTyresEnabled } from "../commands/adminThings/handleManageTyresCommand";
import { raceTyresInQualyEnabled, Tires, tyresActivated } from "./tires";

export let blowoutTyresActivated = true;

const MANAGE_TYRES_STINT_BLOWOUT_CHANCE = 0.10;
const BLOWOUT_RISK_START_WEAR = 45;
const BLOWOUT_RISK_MIN_PER_SECOND = 0.001;
const BLOWOUT_RISK_MAX_PER_SECOND = 0.25;
const BLOWOUT_RISK_EXPONENT = 2.5;
const BLOWOUT_WARNING_MIN_RISK_RATIO = 0.20;
const BLOWOUT_WARNING_MAX_RISK_RATIO = 0.80;

export function setBlowoutTyresActivated(boolean: boolean) {
  blowoutTyresActivated = boolean;
}

export function decideBlowoutPoint(player: PlayerObject) {
  const p = playerList[player.id];
  if (!p) return;

  if (p.tires === Tires.TRAIN) {
    resetBlowoutChance(player.id);
    p.isTyreBlowed = false;
    return;
  }

  if (!isManageTyresEnabled()) {
    const tyreBlownChance = 5;
    let wearPoint = 100;

    const willBlow = Math.random() <= tyreBlownChance / 100;

    if (willBlow) {
      const ranges = [
        { min: 0, max: 10, chance: 0 },
        { min: 10, max: 20, chance: 0 },
        { min: 20, max: 30, chance: 0 },
        { min: 30, max: 40, chance: 0 },
        { min: 40, max: 50, chance: 0 },
        { min: 50, max: 60, chance: 0.25 },
        { min: 60, max: 70, chance: 0.3 },
        { min: 70, max: 80, chance: 0.25 },
        { min: 80, max: 90, chance: 0.15 },
        { min: 90, max: 99, chance: 0.05 },
      ];

      const roll = Math.random();
      let cumulative = 0;
      let selected = ranges[ranges.length - 1];

      for (const r of ranges) {
        cumulative += r.chance;
        if (roll <= cumulative) {
          selected = r;
          break;
        }
      }

      wearPoint = randomBetween(selected.min, selected.max);
    }

    p.blowAtWear = wearPoint;

    let warnOffset = 0;
    let warningIsFalse = false;

    if (willBlow) {
      const warningChance = Math.random() * 100;
      if (warningChance <= 35) warnOffset = randomBetween(25, 30);
      else if (warningChance <= 60) warnOffset = randomBetween(15, 24);
      else if (warningChance <= 75) warnOffset = randomBetween(8, 15);
      else if (warningChance <= 80) warnOffset = randomBetween(3, 7);
      else warnOffset = 0;
    } else if (Math.random() <= 0.05) {
      warnOffset = randomBetween(5, 15);
      warningIsFalse = true;
    }

    if (warnOffset > 0) {
      p.warningAtWear = warningIsFalse
        ? randomBetween(50, 90)
        : Math.max(0, wearPoint - warnOffset);
      p.warningIsFalse = warningIsFalse;
    } else {
      p.warningAtWear = null;
      p.warningIsFalse = false;
    }

    p.tireBlowWarning = false;
    p.isTyreBlowed = false;
  } else {
    const willBlow = Math.random() <= MANAGE_TYRES_STINT_BLOWOUT_CHANCE;
    p.blowoutRisk = 0;
    p.blowoutRiskLimit = randomBetween(0.9, 1.15);
    p.blowoutWarningRiskRatio = randomBetween(
      BLOWOUT_WARNING_MIN_RISK_RATIO,
      BLOWOUT_WARNING_MAX_RISK_RATIO
    );
    p.lastBlowoutRiskTime = 0;
    p.blowoutTickCounter = 0;
    
    if (willBlow) {
      p.blowAtWear = -1;
      p.warningAtWear = null;
      p.warningIsFalse = false;
      p.tireBlowWarning = false;
    } else {
      p.blowAtWear = 9999;
      p.warningAtWear = null;
      p.warningIsFalse = false;
      p.tireBlowWarning = false;
    }
    
    p.isTyreBlowed = false;
  }
}

export function resetBlowoutChance(playerId: number) {
  const p = playerList[playerId];
  if (!p) return;

  p.blowAtWear = 9999;
  p.warningAtWear = null;
  p.warningIsFalse = false;
  p.tireBlowWarning = false;
  p.blowoutTickCounter = 0;
  p.blowoutRisk = 0;
  p.blowoutRiskLimit = 1;
  p.blowoutWarningRiskRatio = 0.65;
  p.lastBlowoutRiskTime = 0;
}

export function checkTireStatus(player: PlayerObject, room: RoomObject) {
  const p = playerList[player.id];
  if (!p || typeof p.blowAtWear !== "number") return;

  if (p.tires === Tires.TRAIN) {
    resetBlowoutChance(player.id);
    p.isTyreBlowed = false;
    return;
  }

  const allowsPunctures =
    generalGameMode === GeneralGameMode.GENERAL_RACE ||
    (generalGameMode === GeneralGameMode.GENERAL_QUALY &&
      gameMode === GameMode.QUALY &&
      raceTyresInQualyEnabled);

  if (
    !blowoutTyresActivated ||
    !tyresActivated ||
    !allowsPunctures
  )
    return;

  if (!isManageTyresEnabled()) {
    if (p.warningAtWear && p.wear >= p.warningAtWear && !p.tireBlowWarning) {
      handleAvatar(Situacions.BlowoutWarning, player, room);
      sendAlertMessage(room, MESSAGES.TYRES_ABOUT_TO_PUNCTURE(), player.id);
      p.tireBlowWarning = true;
    }

    if (p.wear >= p.blowAtWear && !p.isTyreBlowed) {
      sendAlertMessage(room, MESSAGES.PUNCTURED_TYRE(), player.id);
      sendChatMessage(room, MESSAGES.TYRE_PUNCTURE(player.name));
      p.isTyreBlowed = true;
    }
  } else {
    if (p.blowAtWear === -1 && !p.isTyreBlowed) {
      const currentTime = room.getScores()?.time ?? 0;
      updateManagedTyreBlowoutRisk(player, room, currentTime);
    }
  }
}

function updateManagedTyreBlowoutRisk(
  player: PlayerObject,
  room: RoomObject,
  currentTime: number
) {
  const p = playerList[player.id];
  if (!p) return;

  if (!p.lastBlowoutRiskTime) {
    p.lastBlowoutRiskTime = currentTime;
    return;
  }

  const elapsedSeconds = Math.max(0, currentTime - p.lastBlowoutRiskTime);
  p.lastBlowoutRiskTime = currentTime;

  if (p.isManagingTyres || elapsedSeconds <= 0) {
    return;
  }

  const riskGain = getManagedTyreBlowoutRiskGainPerSecond(p.wear);
  if (riskGain <= 0) {
    return;
  }

  p.blowoutTickCounter++;
  p.blowoutRisk += riskGain * elapsedSeconds;

  const riskLimit = p.blowoutRiskLimit || 1;
  const warningRiskRatio = p.blowoutWarningRiskRatio || 0.65;
  if (
    p.blowoutRisk >= riskLimit * warningRiskRatio &&
    !p.tireBlowWarning
  ) {
    handleAvatar(Situacions.BlowoutWarning, player, room);
    sendAlertMessage(room, MESSAGES.TYRES_ABOUT_TO_PUNCTURE(), player.id);
    p.tireBlowWarning = true;
  }

  if (p.blowoutRisk >= riskLimit && !p.isTyreBlowed) {
    sendAlertMessage(room, MESSAGES.PUNCTURED_TYRE(), player.id);
    sendChatMessage(room, MESSAGES.TYRE_PUNCTURE(player.name));
    p.isTyreBlowed = true;
    p.isManagingTyres = true;
  }
}

function getManagedTyreBlowoutRiskGainPerSecond(wear: number): number {
  if (wear <= BLOWOUT_RISK_START_WEAR) return 0;

  const normalizedWear = Math.min(
    1,
    (wear - BLOWOUT_RISK_START_WEAR) / (100 - BLOWOUT_RISK_START_WEAR)
  );
  const exponentialRisk = normalizedWear ** BLOWOUT_RISK_EXPONENT;

  return (
    BLOWOUT_RISK_MIN_PER_SECOND +
    (BLOWOUT_RISK_MAX_PER_SECOND - BLOWOUT_RISK_MIN_PER_SECOND) *
      exponentialRisk
  );
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
