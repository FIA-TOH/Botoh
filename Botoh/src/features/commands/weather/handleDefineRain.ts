import { setRainConfig } from "../../rain/rainConfig";
import { COLORS, FONTS } from "../../chat/chat";
import { execSync } from "child_process";
import { join } from "path";


function generateWeatherId(): string {
  return `rain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function handleDefineRain(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (room.getScores() !== null) {
    room.sendAnnouncement(
      "❌ Error: The game has already started. You can only set rain parameters before the game begins.",
      byPlayer.id,
      COLORS.RED,
      FONTS.BOLD
    );
    return;
  }

  // Validate arguments
  if (args.length < 2) {
    room.sendAnnouncement(
      "❌ Error: Incorrect usage. Use: !rain [probability] [duration] [instability_factor (optional, default: 1)]",
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
