import { setRainConfig } from "../../weather/rain/rainConfig";
import { COLORS, FONTS } from "../../chat/chat";
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
    
    let intensity = 50; // default intensity
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
    
    // Set all rain values to the specified intensity
    currentWeather.rainGlobal = intensity;
    currentWeather.rainS1 = intensity;
    currentWeather.rainS2 = intensity;
    currentWeather.rainS3 = intensity;
    
    // Set wet values to 100% for all sectors when rain starts
    currentWeather.wetS1 = 100;
    currentWeather.wetS2 = 100;
    currentWeather.wetS3 = 100;
    currentWeather.wetAvg = 100;
    
    room.sendAnnouncement(
      `🌧️ Rain started with intensity: ${intensity}%\n💧 Track wetness: 100%`,
      byPlayer.id,
      COLORS.GREEN,
      FONTS.BOLD
    );
    return;
  }

  // Original rain generation logic (for backward compatibility)
  // Check if game has started for original rain generation
  if (room.getScores() !== null) {
    room.sendAnnouncement(
      "❌ Error: The game has already started. You can only set rain parameters before game begins.",
      byPlayer.id,
      COLORS.RED,
      FONTS.BOLD
    );
    return;
  }

  // Validate arguments
  if (args.length < 2) {
    room.sendAnnouncement(
      "❌ Error: Incorrect usage. Use: !rain [probability] [duration] [instability_factor (optional, default: 1)] OR !rain [start|stop] [intensity (optional, for start)]",
      byPlayer.id,
      COLORS.RED,
      FONTS.BOLD
    );
    return;
  }

  const probability = parseFloat(args[0]);
  const duration = parseFloat(args[1]);
  const instabilityFactor = args.length >= 3 ? parseFloat(args[2]) : 1;

  // Validate probability
  if (isNaN(probability) || probability < 0 || probability > 100) {
    room.sendAnnouncement(
      "❌ Error: Probability must be a number between 0 and 100.",
      byPlayer.id,
      COLORS.RED,
      FONTS.BOLD
    );
    return;
  }

  // Validate duration
  if (isNaN(duration) || duration <= 0) {
    room.sendAnnouncement(
      "❌ Error: Duration must be a positive number (in minutes).",
      byPlayer.id,
      COLORS.RED,
      FONTS.BOLD
    );
    return;
  }

  // Validate instability factor (only if provided)
  if (args.length >= 3 && (isNaN(instabilityFactor) || instabilityFactor < 0 || instabilityFactor > 10)) {
    room.sendAnnouncement(
      "❌ Error: Instability factor must be a number between 0 and 10.",
      byPlayer.id,
      COLORS.RED,
      FONTS.BOLD
    );
    return;
  }

  // Generate unique weather ID
  const weatherId = generateWeatherId();

  // Set the rain config
  setRainConfig({
    probability,
    duration,
    instabilityFactor,
  });


  // Execute weatherCalculator to generate weather data
  try {
    const weatherDir = join(__dirname, "../../weather");
    const command = `node weatherCalculator.js ${probability} ${Math.ceil(duration)} ${weatherId}`;
    execSync(command, {
      cwd: weatherDir,
      stdio: "pipe",
    });

    // Save the last weather ID
    (global as any).lastWeatherId = weatherId;
    writeFileSync(join(weatherDir, "lastWeatherId.json"), JSON.stringify({ lastWeatherId: weatherId }));

    // Start weather monitoring with room reference
    startWeatherMonitoring(weatherId, room);

    // Send success message with weather ID
    room.sendAnnouncement(
      `✅ Rain parameters set successfully!\nProbability: ${probability}% | Duration: ${duration}min | Instability: ${instabilityFactor}\n📊 Weather ID: ${weatherId}`,
      byPlayer.id,
      COLORS.GREEN,
      FONTS.BOLD
    );
  } catch (error) {
    // Weather generation failed, but config was set
    room.sendAnnouncement(
      `⚠️ Rain config saved, but weather data generation failed.\nWeather ID: ${weatherId}`,
      byPlayer.id,
      COLORS.YELLOW,
      FONTS.BOLD
    );
  }
}
