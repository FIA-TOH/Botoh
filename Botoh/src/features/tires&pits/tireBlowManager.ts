import {
  gameMode,
  GeneralGameMode,
  generalGameMode,
} from "../changeGameState/changeGameModes";
import { handleAvatar, Situacions } from "../changePlayerState/handleAvatar";
import { playerList } from "../changePlayerState/playerList";
import { sendAlertMessage, sendChatMessage } from "../chat/chat";
import { MESSAGES } from "../chat/messages";
import { changeTires } from "./changeTires";
import { Tires } from "./tires";

export let blowoutTyresActivated = true;

export function setBlowoutTyresActivated(boolean: boolean) {
  blowoutTyresActivated = boolean;
}

export function decideBlowoutPoint(player: PlayerObject) {
  const p = playerList[player.id];
  if (!p) return;

  const tyreBlownChance = 5;
  let wearPoint = 100;

  const willBlow = Math.random() <= tyreBlownChance / 100;

  if (willBlow) {
    const ranges = [
      { min: 0, max: 10, chance: 0.0001 },
      { min: 10, max: 20, chance: 0.0005 },
      { min: 20, max: 30, chance: 0.01 },
      { min: 30, max: 40, chance: 0.08 },
      { min: 40, max: 50, chance: 0.05 },
      { min: 50, max: 60, chance: 0.14 },
      { min: 60, max: 70, chance: 0.3 },
      { min: 70, max: 80, chance: 0.25 },
      { min: 80, max: 90, chance: 0.15 },
      { min: 90, max: 99, chance: 0.0594 },
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
}

export function resetBlowoutChance(playerId: number) {
  const p = playerList[playerId];
  if (!p) return;

  p.blowAtWear = 9999;
  p.warningAtWear = null;
  p.warningIsFalse = false;
  p.warningShown = false;
}

export function checkTireStatus(player: PlayerObject, room: RoomObject) {
  const p = playerList[player.id];
  if (!p || typeof p.blowAtWear !== "number") return;

  if (
    !blowoutTyresActivated ||
    generalGameMode !== GeneralGameMode.GENERAL_RACE
  )
    return;

  if (p.warningAtWear && p.wear >= p.warningAtWear && !p.warningShown) {
    handleAvatar(Situacions.BlowoutWarning, player, room);
    sendAlertMessage(room, MESSAGES.TYRES_ABOUT_TO_BLOWN(), player.id);
    p.warningShown = true;
  }

  if (p.wear >= p.blowAtWear && !(p.tires as any)[Tires.FLAT]) {
    changeTires(
      { p: player, disc: room.getPlayerDiscProperties(player.id) },
      Tires.FLAT,
      room
    );

    sendAlertMessage(room, MESSAGES.BLOWN_OUT_UNLUCKY_TIRES(), player.id);
    sendChatMessage(room, MESSAGES.TYRE_BLOW(player.name));
  }
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
