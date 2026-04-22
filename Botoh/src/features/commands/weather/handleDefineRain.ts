import { setRainConfig } from "../../weather/rain/rainConfig";
import { COLORS, FONTS, sendErrorMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { execSync } from "child_process";
import { join } from "path";
import { lastWeatherId } from "../../weather/lastWeatherId";
import { writeFileSync } from "fs";
import { currentWeather } from "../../weather/currentWeather";
import { stopWeatherMonitoring, startWeatherMonitoring } from "../../weather/weatherManager";


function generateWeatherId(): string {
  return `rain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function handleDefineRain(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (!byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }

  // Handle stop command (can be used during game)
  if (args[0] === "stop") {
    // Stop weather monitoring
    stopWeatherMonitoring();
    
    // Clear all rain values
    currentWeather.rainGlobal = 0;
    currentWeather.rainS1 = 0;
    currentWeather.rainS2 = 0;
    currentWeather.rainS3 = 0;
    currentWeather.wetS1 = 0;
    currentWeather.wetS2 = 0;
    currentWeather.wetS3 = 0;
    currentWeather.wetAvg = 0;
    
    // Clear last weather ID
    try {
      const weatherDir = join(__dirname, "../../weather");
      writeFileSync(join(weatherDir, "lastWeatherId.json"), JSON.stringify({ lastWeatherId: null }));
    } catch (error) {
      console.error("Failed to clear lastWeatherId:", error);
    }
    
    room.sendAnnouncement(
      "🌤️ Rain stopped and weather monitoring disabled.",
      byPlayer.id,
      COLORS.GREEN,
      FONTS.BOLD
    );
    return;
  }
  
  // Handle start command
  if (args[0] === "start") {
    // Clear last weather ID
    try {
      const weatherDir = join(__dirname, "../../weather");
      writeFileSync(join(weatherDir, "lastWeatherId.json"), JSON.stringify({ lastWeatherId: null }));
    } catch (error) {
      console.error("Failed to clear lastWeatherId:", error);
    }
    
    let intensity = 50;
    let wetness = null;
    
    if (args.length >= 2) {
      const parsedIntensity = parseFloat(args[1]);
      if (!isNaN(parsedIntensity) && parsedIntensity >= 0 && parsedIntensity <= 100) {
        intensity = parsedIntensity;
      } else {
        room.sendAnnouncement(
          "❌ Error: Intensity must be a number between 0 and 100.",
          byPlayer.id,
          COLORS.RED,
          FONTS.BOLD
        );
        return;
      }
    }
    
    if (args.length >= 3) {
      const parsedWetness = parseFloat(args[2]);
      if (!isNaN(parsedWetness) && parsedWetness >= 0 && parsedWetness <= 100) {
        wetness = parsedWetness;
      } else {
        room.sendAnnouncement(
          "❌ Error: Wetness must be a number between 0 and 100.",
          byPlayer.id,
          COLORS.RED,
          FONTS.BOLD
        );
        return;
      }
    }
    
    currentWeather.rainGlobal = intensity;
    currentWeather.rainS1 = intensity;
    currentWeather.rainS2 = intensity;
    currentWeather.rainS3 = intensity;
    
    const finalWetness = wetness !== null ? wetness : intensity;
    currentWeather.wetS1 = finalWetness;
    currentWeather.wetS2 = finalWetness;
    currentWeather.wetS3 = finalWetness;
    currentWeather.wetAvg = finalWetness;
    
    room.sendAnnouncement(
      `🌧️ Rain started with intensity: ${intensity}%\n💧 Track wetness: ${finalWetness}%`,
      byPlayer.id,
      COLORS.GREEN,
      FONTS.BOLD
    );
    return;
  }

  if (room.getScores() !== null) {
    room.sendAnnouncement(
      "❌ Error: The game has already started. You can only set rain parameters before game begins.",
      byPlayer.id,
      COLORS.RED,
      FONTS.BOLD
    );
    return;
  }

  if (args.length < 2) {
    room.sendAnnouncement(
      "❌ Error: Incorrect usage. Use: !rain [probability] [duration] [instability_factor (optional, default: 1)] OR !rain [start|stop] [intensity (optional, for start)] [wetness (optional, defaults to intensity)]",
      byPlayer.id,
      COLORS.RED,
      FONTS.BOLD
    );
    return;
  }

  const probability = parseFloat(args[0]);
  const duration = parseFloat(args[1]);
  const instabilityFactor = args.length >= 3 ? parseFloat(args[2]) : 1;

  if (isNaN(probability) || probability < 0 || probability > 100) {
    room.sendAnnouncement(
      "❌ Error: Probability must be a number between 0 and 100.",
      byPlayer.id,
      COLORS.RED,
      FONTS.BOLD
    );
    return;
  }

  if (isNaN(duration) || duration <= 0) {
    room.sendAnnouncement(
      "❌ Error: Duration must be a positive number (in minutes).",
      byPlayer.id,
      COLORS.RED,
      FONTS.BOLD
    );
    return;
  }

  if (args.length >= 3 && (isNaN(instabilityFactor) || instabilityFactor < 0 || instabilityFactor > 10)) {
    room.sendAnnouncement(
      "❌ Error: Instability factor must be a number between 0 and 10.",
      byPlayer.id,
      COLORS.RED,
      FONTS.BOLD
    );
    return;
  }

  const weatherId = generateWeatherId();

  // Set the rain config
  setRainConfig({
    probability,
    duration,
    instabilityFactor,
  });


  try {
    const weatherDir = join(__dirname, "../../weather");
    const command = `node weatherCalculator.js ${probability} ${Math.ceil(duration)} ${weatherId}`;
    execSync(command, {
      cwd: weatherDir,
      stdio: "pipe",
    });

    (global as any).lastWeatherId = weatherId;
    writeFileSync(join(weatherDir, "lastWeatherId.json"), JSON.stringify({ lastWeatherId: weatherId }));

    startWeatherMonitoring(weatherId, room);

    room.sendAnnouncement(
      `✅ Rain parameters set successfully!\nProbability: ${probability}% | Duration: ${duration}min | Instability: ${instabilityFactor}\n📊 Weather ID: ${weatherId}`,
      byPlayer.id,
      COLORS.GREEN,
      FONTS.BOLD
    );
  } catch (error) {
    room.sendAnnouncement(
      `⚠️ Rain config saved, but weather data generation failed.\nWeather ID: ${weatherId}`,
      byPlayer.id,
      COLORS.YELLOW,
      FONTS.BOLD
    );
  }
}
