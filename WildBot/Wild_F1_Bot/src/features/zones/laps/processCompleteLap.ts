import {
  getAbbreviatedTrackName,
  bestTimes,
  updateBestTime,
} from "../../../circuits/bestTimes";
import { updatePlayerTime } from "../../changeGameState/qualy/playerTime";
import { playerList } from "../../changePlayerState/playerList";
import {
  sendBestTimeRace,
  sendWorseTime,
  sendChatMessage,
  sendSuccessMessage,
} from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { log } from "../../discord/logger";
import { getPlayerAndDiscs } from "../../playerFeatures/getPlayerAndDiscs";
import { rainEnabled, rainIntensity } from "../../rain/rain";
import { ACTUAL_CIRCUIT } from "../../roomFeatures/stadiumChange";
import { serialize, someArray } from "../../utils";
import { drsOn, enableDRS } from "../handleDRSZone";
import { handleChangeCollisionPlayerSuzuka } from "../handleSuzukaTp";
import { broadcastLapTimeToPlayers } from "./broadcastTimeToPlayer";
import { processLapAndCheckSessionEnd } from "./processLapAndCheckSessionEnd";

export function processCompletedLap(
  pad: { p: PlayerObject; disc: DiscPropertiesObject },
  room: RoomObject,
  hasSector: boolean
) {
  const p = pad.p;
  const playerData = playerList[p.id];
  const playerAndDiscs = getPlayerAndDiscs(room);

  if (playerData.currentLap === 2 && !drsOn) enableDRS(room);

  let lapTime = serialize(playerData.lapTime);
  if (hasSector) lapTime = serialize(someArray(playerData.sectorTime));

  const bestTimeP = serialize(playerData.bestTime);
  const abbreviatedTrackName = getAbbreviatedTrackName(
    ACTUAL_CIRCUIT.info.name
  );

  if (!abbreviatedTrackName) {
    log(
      `Circuito ${ACTUAL_CIRCUIT.info.name} não encontrado no mapeamento de nomes.`
    );
    return;
  }

  const circuitBestTime = bestTimes[abbreviatedTrackName]?.[0] ?? 999.999;

  if (typeof circuitBestTime === "number" && lapTime < circuitBestTime) {
    updateBestTime(ACTUAL_CIRCUIT.info.name, lapTime, p.name);
    playerData.bestTime = lapTime;
    sendBestTimeRace(room, MESSAGES.TRACK_RECORD(p.name, lapTime));
    updatePlayerTime(p.name, lapTime, p.id);
  } else if (lapTime < bestTimeP || bestTimeP === undefined) {
    sendSuccessMessage(room, MESSAGES.LAP_TIME(lapTime), p.id);
    playerData.bestTime = lapTime;
    broadcastLapTimeToPlayers(room, lapTime, p.name);
    updatePlayerTime(p.name, lapTime, p.id);
  } else {
    sendWorseTime(
      room,
      MESSAGES.WORSE_TIME(lapTime, serialize(lapTime - bestTimeP)),
      p.id
    );
    broadcastLapTimeToPlayers(room, lapTime, p.name, false);
  }

  if (hasSector) {
    room.sendAnnouncement(
      `Sector 1: ${playerData.sectorTime[0]} | Sector 2: ${playerData.sectorTime[1]} | Sector 3: ${playerData.sectorTime[2]}`,
      p.id,
      0xff8f00
    );
  }
  if (rainEnabled) {
    sendChatMessage(
      room,
      MESSAGES.RAIN_INTENSITY_LAP(Math.round(rainIntensity)),
      p.id
    );
  }

  sendChatMessage(
    room,
    MESSAGES.TYRE_WEAR_LAP(100 - Math.round(playerData.wear)),
    p.id
  );

  processLapAndCheckSessionEnd(pad, room, lapTime, playerAndDiscs);
}
