import { updateBestTime } from "../../../../circuits/bestTimes";
import { playerList } from "../../../changePlayerState/playerList";
import {
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
) {
  const playerData = playerList[p.id];
  const bestTimeP = serialize(playerData.bestTime);

  if (playerData.lastLapValid && lapTime < circuitBestTime) {
    updateBestTime(ACTUAL_CIRCUIT.info.name, lapTime, p.name);
    playerData.bestTime = lapTime;

    sendBestTimeEver(room, MESSAGES.TRACK_RECORD(p.name, lapTime));
    sendDiscordTrackRecord(p.name, lapTime);
    updatePlayerTime(p.name, lapTime, p.id, playerData.leagueScuderia);
    return;
  }

  if (playerData.lastLapValid && isFastestLapRace) {
    sendBestTimeRace(room, MESSAGES.FASTEST_LAP(p.name, lapTime));
  }

  if (
    (playerData.lastLapValid && lapTime < bestTimeP) ||
    (playerData.lastLapValid && bestTimeP === undefined)
  ) {
    sendSuccessMessage(room, MESSAGES.LAP_TIME(lapTime), p.id);
    playerData.bestTime = lapTime;

    broadcastLapTimeToPlayers(room, lapTime, p.name);
    updatePlayerTime(p.name, lapTime, p.id, playerData.leagueScuderia);
  } else {
    const MAX_REASONABLE_LAP = 600; // 10 minutes

    const isValidBestTime =
      typeof bestTimeP === "number" &&
      isFinite(bestTimeP) &&
      bestTimeP > 0 &&
      bestTimeP < MAX_REASONABLE_LAP;

    const differenceToBestTime = isValidBestTime ? lapTime - bestTimeP : 0;

    sendWorseTime(
      room,
      MESSAGES.WORSE_TIME(lapTime, serialize(differenceToBestTime)),
      p.id,
    );

    broadcastLapTimeToPlayers(room, lapTime, p.name, false);
  }
}
