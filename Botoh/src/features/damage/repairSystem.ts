import { handleAvatar, restoreTyreOrCar, Situacions } from "../changePlayerState/handleAvatar";
import { playerList } from "../changePlayerState/playerList";
import { sendAlertMessage, sendErrorMessage, sendSuccessMessage } from "../chat/chat";
import { MESSAGES } from "../chat/messages";
import { isXKeyPressed } from "../utils/dampingValues";

const MIN_REPAIR_TIME = 1.5;
const MAX_REPAIR_TIME = 18;
const DAMAGE_REPAIR_TIME_FACTOR = 0.03;
const REACTION_REPAIR_TIME_FACTOR = 3;
const BASE_REPAIR_TIME = 1;
const EARLY_REACTION_PENALTY = 3;
const REACTION_TIMEOUT = 3;
const REPAIR_CANCEL_DISTANCE = 0.3;

function roundSeconds(value: number) {
  return Math.round(value * 10) / 10;
}

function calculateRepairTime(damage: number, reactionTime: number) {
  const repairTime =
    BASE_REPAIR_TIME +
    damage * DAMAGE_REPAIR_TIME_FACTOR +
    reactionTime * REACTION_REPAIR_TIME_FACTOR;

  return roundSeconds(Math.max(MIN_REPAIR_TIME, Math.min(MAX_REPAIR_TIME, repairTime)));
}

export function isPlayerRepairing(playerId: number): boolean {
  return playerList[playerId]?.repairState?.isRepairing === true;
}

function resetRepairState(playerId: number) {
  const playerInfo = playerList[playerId];
  if (!playerInfo) return;

  playerInfo.repairState = {
    isWaitingForRepair: false,
    isRepairing: false,
    repairStartTime: undefined,
    repairInitialPos: undefined,
    repairReadyTime: undefined,
    repairEmojiShowTime: undefined,
    reactionTime: undefined,
    repairEndTime: undefined,
    damageToRepair: undefined,
  };
}

function startRepair(player: PlayerObject, room: RoomObject, reactionTime: number) {
  const playerInfo = playerList[player.id];
  if (!playerInfo?.repairState) return;

  const currentTime = room.getScores()?.time || 0;
  const damageToRepair = Math.max(0, Math.min(100, playerInfo.repairState.damageToRepair ?? playerInfo.carDamage));
  const repairTime = calculateRepairTime(damageToRepair, reactionTime);

  playerInfo.repairState.isWaitingForRepair = false;
  playerInfo.repairState.isRepairing = true;
  playerInfo.repairState.reactionTime = reactionTime;
  playerInfo.repairState.repairStartTime = currentTime;
  playerInfo.repairState.repairEndTime = currentTime + repairTime;

  handleAvatar(Situacions.Repairing, player, room);
  room.setPlayerAvatar(player.id, "🔧");
  sendAlertMessage(room, MESSAGES.REPAIR_STARTED(repairTime.toString()), player.id);
}

export function handleFixCommand(
  byPlayer: PlayerObject,
  _args: string[],
  room: RoomObject,
) {
  const playerInfo = playerList[byPlayer.id];
  if (!playerInfo) return;

  if (playerInfo.inPitStop) {
    sendErrorMessage(room, MESSAGES.REPAIR_IN_PIT_STOP(), byPlayer.id);
    return;
  }

  if (playerInfo.repairState?.isWaitingForRepair || playerInfo.repairState?.isRepairing) {
    sendErrorMessage(room, MESSAGES.REPAIR_ALREADY_ACTIVE(), byPlayer.id);
    return;
  }

  const damageToRepair = Math.max(0, Math.min(100, playerInfo.carDamage ?? 0));
  if (damageToRepair <= 0) {
    sendErrorMessage(room, MESSAGES.REPAIR_NO_DAMAGE(), byPlayer.id);
    return;
  }

  const currentTime = room.getScores()?.time || 0;
  const delaySeconds = Math.random() * 1.8 + 0.2;

  playerInfo.repairState = {
    isWaitingForRepair: true,
    isRepairing: false,
    repairStartTime: currentTime,
    repairInitialPos: { x: byPlayer.position.x, y: byPlayer.position.y },
    repairReadyTime: currentTime + delaySeconds,
    repairEmojiShowTime: undefined,
    reactionTime: undefined,
    repairEndTime: undefined,
    damageToRepair,
  };
}

export function updateRepairSystemForPlayer(
  p: PlayerObject,
  properties: DiscPropertiesObject,
  room: RoomObject,
  currentTime: number,
) {
  const playerInfo = playerList[p.id];
  const repairState = playerInfo?.repairState;
  if (!playerInfo || !repairState) return;

  if (
    (repairState.isWaitingForRepair || repairState.isRepairing) &&
    repairState.repairInitialPos &&
    Math.hypot(
      properties.x - repairState.repairInitialPos.x,
      properties.y - repairState.repairInitialPos.y,
    ) > REPAIR_CANCEL_DISTANCE
  ) {
    resetRepairState(p.id);
    restoreTyreOrCar(p.id, room);
    sendAlertMessage(room, MESSAGES.REPAIR_CANCELED(), p.id);
    return;
  }

  if (repairState.isRepairing && repairState.repairEndTime && currentTime >= repairState.repairEndTime) {
    playerInfo.carDamage = 0;
    resetRepairState(p.id);
    handleAvatar(Situacions.Correct, p, room);
    room.setPlayerAvatar(p.id, "\u2705");
    sendSuccessMessage(room, MESSAGES.REPAIR_FINISHED(), p.id);
    return;
  }

  if (!repairState.isWaitingForRepair || repairState.isRepairing) return;

  if (
    !repairState.repairEmojiShowTime &&
    repairState.repairReadyTime &&
    currentTime >= repairState.repairReadyTime
  ) {
    repairState.repairEmojiShowTime = currentTime;
    repairState.repairReadyTime = undefined;
    handleAvatar(Situacions.RepairReady, p, room);
    room.setPlayerAvatar(p.id, "⚡");
  }

  if (isXKeyPressed(properties.damping)) {
    const reactionTime = repairState.repairEmojiShowTime
      ? currentTime - repairState.repairEmojiShowTime
      : EARLY_REACTION_PENALTY;
    startRepair(p, room, Math.max(0, reactionTime));
    return;
  }

  if (
    repairState.repairEmojiShowTime &&
    currentTime >= repairState.repairEmojiShowTime + REACTION_TIMEOUT
  ) {
    startRepair(p, room, REACTION_TIMEOUT);
  }
}
