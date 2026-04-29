import { COLORS, FONTS } from "../../chat/chat";
import { writeFileSync } from "fs";
import { join } from "path";
import { startWeatherMonitoring } from "../../weather/weatherManager";

export function handleSetNewWeatherId(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (room.getScores() !== null) {
    room.sendAnnouncement(
      "❌ Error: The game has already started. You can only set weather ID before the game begins.",
      byPlayer.id,
      COLORS.RED,
      FONTS.BOLD
    );
    return;
  }

  if (args.length < 1) {
    room.sendAnnouncement(
      "❌ Error: Incorrect usage. Use: !set_weather_id [weather_id]",
      byPlayer.id,
      COLORS.RED,
      FONTS.BOLD
    );
    return;
  }

  const weatherId = args[0];

  if (!weatherId || typeof weatherId !== 'string' || weatherId.trim().length === 0) {
    room.sendAnnouncement(
      "❌ Error: Invalid weather ID format.",
      byPlayer.id,
      COLORS.RED,
      FONTS.BOLD
    );
    return;
  }

  try {
    const weatherDir = join(__dirname, "../../weather");
    const lastWeatherPath = join(weatherDir, "lastWeatherId.json");
    writeFileSync(lastWeatherPath, JSON.stringify({ lastWeatherId: weatherId }));

    startWeatherMonitoring(weatherId);

    room.sendAnnouncement(
      `✅ Weather ID set successfully!\n📊 New Weather ID: ${weatherId}`,
      byPlayer.id,
      COLORS.GREEN,
      FONTS.BOLD
    );
  } catch (error) {
    room.sendAnnouncement(
      `❌ Failed to set weather ID. Please check if the weather data exists for ID: ${weatherId}`,
      byPlayer.id,
      COLORS.RED,
      FONTS.BOLD
    );
    console.error("Failed to set weather ID:", error);
  }
}
