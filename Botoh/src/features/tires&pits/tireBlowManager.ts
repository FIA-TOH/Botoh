import {
  gameMode,
  GeneralGameMode,
  generalGameMode,
} from "../changeGameState/changeGameModes";
import { handleAvatar, Situacions } from "../changePlayerState/handleAvatar";
import { playerList } from "../changePlayerState/playerList";
import { sendAlertMessage, sendChatMessage } from "../chat/chat";
import { MESSAGES } from "../chat/messages";
import { isManageTyresEnabled } from "../commands/adminThings/handleManageTyresCommand";

export let blowoutTyresActivated = true;

export function setBlowoutTyresActivated(boolean: boolean) {
  blowoutTyresActivated = boolean;
}

export function decideBlowoutPoint(player: PlayerObject) {
  const p = playerList[player.id];
  if (!p) return;

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

    p.warningShown = false;
    p.isTyreBlowed = false;
  } else {
    const willBlow = Math.random() <= 0.1;
    
    if (willBlow) {
      p.blowoutTickCounter = 0;
      p.blowAtWear = -1;

      let warningOffset = 0;
      let warningIsFalse = false;
      
      if (Math.random() <= 0.95) {
        warningOffset = randomBetween(2, 15);
        warningIsFalse = false;
      } else {
        warningOffset = randomBetween(2, 15);
        warningIsFalse = true;
      }
      
      if (warningOffset > 0) {
        p.warningAtWear = warningIsFalse
          ? randomBetween(50, 90) 
          : Math.max(0, 100 - warningOffset);
        p.warningIsFalse = warningIsFalse;
      } else {
        p.warningAtWear = null;
        p.warningIsFalse = false;
      }
      
      p.warningShown = false;
    } else {
      p.blowAtWear = 9999;
      p.warningAtWear = null;
      p.warningIsFalse = false;
      p.warningShown = false;
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
  p.warningShown = false;
  p.blowoutTickCounter = 0;
}

export function checkTireStatus(player: PlayerObject, room: RoomObject) {
  const p = playerList[player.id];
  if (!p || typeof p.blowAtWear !== "number") return;

  if (
    !blowoutTyresActivated ||
    generalGameMode !== GeneralGameMode.GENERAL_RACE
  )
    return;

  if (!isManageTyresEnabled()) {
    if (p.warningAtWear && p.wear >= p.warningAtWear && !p.warningShown) {
      handleAvatar(Situacions.BlowoutWarning, player, room);
      sendAlertMessage(room, MESSAGES.TYRES_ABOUT_TO_BLOWN(), player.id);
      p.warningShown = true;
    }

    if (p.wear >= p.blowAtWear && !p.isTyreBlowed) {
      sendAlertMessage(room, MESSAGES.BLOWN_OUT_UNLUCKY_TIRES(), player.id);
      sendChatMessage(room, MESSAGES.TYRE_BLOW(player.name));
      p.isTyreBlowed = true;
    }
  } else {
    if (p.blowAtWear === -1 && !p.isTyreBlowed) {
      if (p.warningAtWear && p.wear >= p.warningAtWear && !p.warningShown) {
        handleAvatar(Situacions.BlowoutWarning, player, room);
        sendAlertMessage(room, MESSAGES.TYRES_ABOUT_TO_BLOWN(), player.id);
        p.warningShown = true;
      }

      if (!p.isManagingTyres) {
        p.blowoutTickCounter++;
        
        const blowChance = getBlowChanceByWear(p.wear);
        
        if (Math.random() <= blowChance) {
          sendAlertMessage(room, MESSAGES.BLOWN_OUT_UNLUCKY_TIRES(), player.id);
          sendChatMessage(room, MESSAGES.TYRE_BLOW(player.name));
          p.isTyreBlowed = true;
          p.isManagingTyres = true;
        }
      }
    }
  }
}

function getBlowChanceByWear(wear: number): number {
  if (wear <= 35) return 0;
  if (wear <= 40) return 0.05;
  if (wear <= 50) return 0.10;
  if (wear <= 60) return 0.20;
  if (wear <= 70) return 0.25;
  if (wear <= 80) return 0.20;
  if (wear <= 90) return 0.10;
  if (wear <= 99) return 0.05;
  return 0;
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
