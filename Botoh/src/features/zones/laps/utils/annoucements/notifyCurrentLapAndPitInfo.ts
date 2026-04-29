import { playerList } from "../../../../changePlayerState/playerList";
import { processIfMinimumPitStopsMet } from "../../../../tires&pits/minimumPit";
import { laps } from "../../../laps";
import { currentWeather } from "../../../../weather/currentWeather";
import { COLORS, FONTS } from "../../../../chat/chat";

export function notifyCurrentLapAndPitInfo(
  p: PlayerObject,
  room: RoomObject,
  currentLap: number
) {
  const data = playerList[p.id];
  let combinedInfo = [];

  combinedInfo.push(`Lap ${currentLap}/${laps}`);

  if (data.tires && data.wear !== undefined) {
    combinedInfo.push(`Tires: ${(100 - data.wear).toFixed(0)}%`);
  }

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

  processIfMinimumPitStopsMet(p, currentLap, laps, data.pits.pitsNumber, room);
}
