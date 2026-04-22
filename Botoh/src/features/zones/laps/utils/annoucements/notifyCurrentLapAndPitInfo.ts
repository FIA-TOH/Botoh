import { playerList } from "../../../../changePlayerState/playerList";
import { sendChatMessage } from "../../../../chat/chat";
import { MESSAGES } from "../../../../chat/messages";
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

  // Add lap information
  combinedInfo.push(`Volta ${currentLap}/${laps}`);

  // Add tire information if active
  if (data.tires && data.wear !== undefined) {
    combinedInfo.push(`Pneus: ${(100 - data.wear).toFixed(0)}%`);
  }

  // Add weather information if there's rain or wet track
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

  // Send combined message
  const finalMessage = combinedInfo.join(' | ');
  room.sendAnnouncement(finalMessage, p.id, COLORS.CYAN, FONTS.NORMAL);

  processIfMinimumPitStopsMet(p, currentLap, laps, data.pits.pitsNumber, room);
}
