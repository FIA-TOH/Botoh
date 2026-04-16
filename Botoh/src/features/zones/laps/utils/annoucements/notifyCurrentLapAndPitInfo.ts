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
  sendChatMessage(room, MESSAGES.CURRENT_LAP(currentLap, laps), p.id);

  const data = playerList[p.id];

  // Add weather information if there's rain or wet track
  if (currentWeather.rainGlobal > 0 || currentWeather.wetAvg > 0) {
    let weatherInfo = "";
    
    if (currentWeather.rainGlobal > 0) {
      weatherInfo += `🌧️ Chuva: ${currentWeather.rainGlobal.toFixed(0)}% `;
    }
    
    if (currentWeather.wetAvg > 0) {
      weatherInfo += `💧 Pista: ${currentWeather.wetAvg.toFixed(0)}% molhada`;
    }
    
    if (weatherInfo) {
      room.sendAnnouncement(weatherInfo.trim(), p.id, COLORS.CYAN, FONTS.NORMAL);
    }
  }

  processIfMinimumPitStopsMet(p, currentLap, laps, data.pits.pitsNumber, room);
}
