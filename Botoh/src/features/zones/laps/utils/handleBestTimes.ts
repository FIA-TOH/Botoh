import { updateBestTime } from "../../../../circuits/bestTimes";
import {
  getEffectiveLeagueScuderiaId,
  playerList,
} from "../../../changePlayerState/playerList";
import {
  COLORS,
  sendBestTimeEver,
  sendBestTimeRace,
  sendSuccessMessage,
  sendWorseTime,
} from "../../../chat/chat";
import { MESSAGES } from "../../../chat/messages";
import { updatePlayerTime } from "../../../commands/gameMode/qualy/playerTime";
import { sendDiscordTrackRecord } from "../../../discord/discord";
import { ACTUAL_CIRCUIT } from "../../../roomFeatures/stadiumChange";
import { serialize } from "../../../utils";
import { broadcastLapTimeToPlayers } from "./annoucements/broadcastTimeToPlayer";

export function handleBestTimes(
  room: RoomObject,
  p: PlayerObject,
  lapTime: number,
  circuitBestTime: number,
  isFastestLapRace: boolean,
  personalBestReference?: number | null,
) {
  const playerData = playerList[p.id];
  const hasPersonalBestReference =
    typeof personalBestReference === "number" &&
    Number.isFinite(personalBestReference) &&
    personalBestReference > 0 &&
    personalBestReference < 999;
  const bestTimeP = hasPersonalBestReference
    ? serialize(personalBestReference)
    : serialize(playerData.bestTime);

  if (playerData.lastLapValid && lapTime < circuitBestTime) {
    updateBestTime(ACTUAL_CIRCUIT.info.name, lapTime, p.name);
    playerData.bestTime = lapTime;

    sendBestTimeEver(room, MESSAGES.TRACK_RECORD(p.name, lapTime));
    playerData.sectorColour = COLORS.PURPLE;
    sendDiscordTrackRecord(p.name, lapTime);
    updatePlayerTime(p.name, lapTime, p.id, getEffectiveLeagueScuderiaId(playerData));
    return;
  }

  if (
    playerData.lastLapValid &&
    isFastestLapRace &&
    (!hasPersonalBestReference || lapTime < bestTimeP)
  ) {
    sendBestTimeRace(room, MESSAGES.FASTEST_LAP(p.name, lapTime));
    playerData.sectorColour = COLORS.PINK;
  }

  if (
    (playerData.lastLapValid && lapTime < bestTimeP) ||
    (playerData.lastLapValid && bestTimeP === undefined)
  ) {
    sendSuccessMessage(room, MESSAGES.LAP_TIME(lapTime), p.id);
    playerData.sectorColour = COLORS.GREEN;
    playerData.bestTime = lapTime;

    broadcastLapTimeToPlayers(room, lapTime, p.name);
    updatePlayerTime(p.name, lapTime, p.id, getEffectiveLeagueScuderiaId(playerData));
  } else {
    if (playerData.lastLapValid && lapTime < playerData.bestTime) {
      playerData.bestTime = lapTime;
      updatePlayerTime(p.name, lapTime, p.id, getEffectiveLeagueScuderiaId(playerData));
    }

    const MAX_REASONABLE_LAP = 600; // 10 minutes

    const isValidBestTime =
      typeof bestTimeP === "number" &&
      isFinite(bestTimeP) &&
      bestTimeP > 0 &&
      bestTimeP < MAX_REASONABLE_LAP;

    const differenceToBestTime = isValidBestTime
      ? Math.abs(lapTime - bestTimeP)
      : 0;

    sendWorseTime(
      room,
      MESSAGES.WORSE_TIME(lapTime, serialize(differenceToBestTime)),
      p.id,
    );
    playerData.sectorColour = COLORS.DARK_YELLOW;

    broadcastLapTimeToPlayers(room, lapTime, p.name, false);
  }
}
