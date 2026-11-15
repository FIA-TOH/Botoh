import { playerList } from "../../../../changePlayerState/playerList";
import { processIfMinimumPitStopsMet } from "../../../../tires&pits/minimumPit";
import { laps } from "../../../laps";
import { currentWeather } from "../../../../weather/currentWeather";
import { COLORS, FONTS } from "../../../../chat/chat";
import { MESSAGES, getPlayerLanguage } from "../../../../chat/messages";
import { isWECModeEnabled } from "../../../../changeGameState/wecMode";
import { getWECRemainingTime } from "../../../../changeGameState/wecRace";

export function notifyCurrentLapAndPitInfo(
  p: PlayerObject,
  room: RoomObject,
  currentLap: number
) {
  const data = playerList[p.id];
  let combinedInfo = [];
  const remaining = getWECRemainingTime(room.getScores()?.time ?? 0);

  combinedInfo.push(isWECModeEnabled()
    ? MESSAGES.WEC_TIME_REMAINING(remaining.minutes, remaining.seconds)[getPlayerLanguage(p.id)]
    : `Lap ${currentLap}/${laps}`);

  //No more need for this message
  // if (data.tires && data.wear !== undefined) {
  //   const playerLang = getPlayerLanguage(p.id);
  //   const tiresMessage = MESSAGES.TIRES_PERCENTAGE((100 - data.wear).toFixed(0));
  //   combinedInfo.push(tiresMessage[playerLang]);
  // }

  const weatherParts = [];
  if (currentWeather.rainGlobal > 0) {
    weatherParts.push(`🌧️: ${currentWeather.rainGlobal.toFixed(0)}%`);
  }
  
  if (currentWeather.wetAvg > 0) {
    weatherParts.push(`💧: ${currentWeather.wetAvg.toFixed(0)}%`);
  }

  if (weatherParts.length > 0) {
    combinedInfo.push(weatherParts.join(' | '));
  }

  const finalMessage = combinedInfo.join(' | ');
  room.sendAnnouncement(finalMessage, p.id, COLORS.CYAN, FONTS.NORMAL);

  if (!isWECModeEnabled()) {
    processIfMinimumPitStopsMet(p, currentLap, laps, data.pits.pitsNumber, room);
  }
}
