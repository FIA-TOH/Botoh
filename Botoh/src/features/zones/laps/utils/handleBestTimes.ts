import { updateBestTime } from "../../../../circuits/bestTimes";
import { updatePlayerTime } from "../../../changeGameState/qualy/playerTime";
import { playerList } from "../../../changePlayerState/playerList";
import {
  sendBestTimeEver,
  sendBestTimeRace,
  sendSuccessMessage,
  sendWorseTime,
} from "../../../chat/chat";
import { MESSAGES } from "../../../chat/messages";
import { sendDiscordTrackRecord } from "../../../discord/discord";
import { ACTUAL_CIRCUIT } from "../../../roomFeatures/stadiumChange";
import { serialize } from "../../../utils";
import { broadcastLapTimeToPlayers } from "./annoucements/broadcastTimeToPlayer";

export function handleBestTimes(
  room: RoomObject,
  p: PlayerObject,
  lapTime: number,
  circuitBestTime: number,
  isFastestLapRace: boolean
) {
  const playerData = playerList[p.id];
  const bestTimeP = serialize(playerData.bestTime);

  if (lapTime < circuitBestTime) {
    updateBestTime(ACTUAL_CIRCUIT.info.name, lapTime, p.name);
    playerData.bestTime = lapTime;

    sendBestTimeEver(room, MESSAGES.TRACK_RECORD(p.name, lapTime));
    sendDiscordTrackRecord(p.name, lapTime);
    updatePlayerTime(p.name, lapTime, p.id, playerData.leagueTeam);
    return;
  }

  if (isFastestLapRace) {
    sendBestTimeRace(room, MESSAGES.FASTEST_LAP(p.name, lapTime));
  }

  if (lapTime < bestTimeP || bestTimeP === undefined) {
    sendSuccessMessage(room, MESSAGES.LAP_TIME(lapTime), p.id);
    playerData.bestTime = lapTime;

    broadcastLapTimeToPlayers(room, lapTime, p.name);
    updatePlayerTime(p.name, lapTime, p.id, playerData.leagueTeam);
  } else {
    sendWorseTime(
      room,
      MESSAGES.WORSE_TIME(lapTime, serialize(lapTime - bestTimeP)),
      p.id
    );

    broadcastLapTimeToPlayers(room, lapTime, p.name, false);
  }
}
