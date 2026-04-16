import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { currentWeather } from "./currentWeather";

let lastRainGlobal: number = 0;
let lastRainS1: number = 0;
let lastRainS2: number = 0;
let lastRainS3: number = 0;

let weatherData: any = null;
let weatherInterval: NodeJS.Timeout | null = null;
let startTime: number = 0;
let lastDataIndex: number = 0;
let interpolationProgress: number = 0;

export function startWeatherMonitoring(weatherId: string, room?: RoomObject) {
  try {
    const weatherDir = __dirname;
    const dataPath = join(weatherDir, "weather_data", `weather_${weatherId}.json`);
    
    // Check if file exists before trying to read
    if (!existsSync(dataPath)) {
      throw new Error(`Weather file not found: ${dataPath}`);
    }
    
    weatherData = JSON.parse(readFileSync(dataPath, "utf-8"));
    startTime = Date.now();

    // Reset previous rain values
    lastRainGlobal = 0;
    lastRainS1 = 0;
    lastRainS2 = 0;
    lastRainS3 = 0;

    // Store room reference for game time access
    if (room) {
      (global as any).weatherRoom = room;
    }

    // Update every 30 seconds for smooth progression
    weatherInterval = setInterval(() => {
      updateCurrentWeather();
    }, 30000);

    console.log(`Weather monitoring started for ID: ${weatherId}`);
  } catch (error) {
    console.error("Failed to start weather monitoring:", error);
  }
}

export function stopWeatherMonitoring() {
  if (weatherInterval) {
    clearInterval(weatherInterval);
    weatherInterval = null;
    weatherData = null;
    startTime = 0;
    // Reset current weather
    Object.keys(currentWeather).forEach(key => {
      (currentWeather as any)[key] = 0;
    });
    console.log("Weather monitoring stopped");
  }
}

function updateCurrentWeather() {
  if (!weatherData || !startTime) return;

  // Try to get game time, fallback to real time
  const weatherRoom = (global as any).weatherRoom;
  let elapsedMinutes: number;
  
  if (weatherRoom) {
    const gameScores = weatherRoom.getScores();
    
    if (gameScores && gameScores.time !== undefined) {
      // Use game time (in seconds, convert to minutes)
      elapsedMinutes = gameScores.time / 60;
    } else {
      // Fallback to real time
      elapsedMinutes = (Date.now() - startTime) / 60000;
    }
  } else {
    // Fallback to real time
    elapsedMinutes = (Date.now() - startTime) / 60000;
  }

  // Calculate exact position for smooth interpolation
  const exactDataIndex = elapsedMinutes * 2; // 2 data points per minute
  const currentDataIndex = Math.floor(exactDataIndex);
  const fraction = exactDataIndex - currentDataIndex; // 0 to 1, interpolation factor

  if (currentDataIndex >= weatherData.time.length - 1) {
    // Weather data ended, use last values
    const lastIndex = weatherData.time.length - 1;
    currentWeather.rainGlobal = weatherData.rain_global[lastIndex] || 0;
    currentWeather.rainS1 = weatherData.rain_s1[lastIndex] || 0;
    currentWeather.rainS2 = weatherData.rain_s2[lastIndex] || 0;
    currentWeather.rainS3 = weatherData.rain_s3[lastIndex] || 0;
    currentWeather.wetS1 = weatherData.wet_s1[lastIndex] || 0;
    currentWeather.wetS2 = weatherData.wet_s2[lastIndex] || 0;
    currentWeather.wetS3 = weatherData.wet_s3[lastIndex] || 0;
    currentWeather.wetAvg = weatherData.wet_avg[lastIndex] || 0;
    return;
  }

  // Smooth interpolation between current and next data point
  const nextDataIndex = currentDataIndex + 1;
  
  function interpolate(current: number, next: number): number {
    return current + (next - current) * fraction;
  }

  currentWeather.rainGlobal = interpolate(
    weatherData.rain_global[currentDataIndex] || 0,
    weatherData.rain_global[nextDataIndex] || 0
  );
  currentWeather.rainS1 = interpolate(
    weatherData.rain_s1[currentDataIndex] || 0,
    weatherData.rain_s1[nextDataIndex] || 0
  );
  currentWeather.rainS2 = interpolate(
    weatherData.rain_s2[currentDataIndex] || 0,
    weatherData.rain_s2[nextDataIndex] || 0
  );
  currentWeather.rainS3 = interpolate(
    weatherData.rain_s3[currentDataIndex] || 0,
    weatherData.rain_s3[nextDataIndex] || 0
  );
  currentWeather.wetS1 = interpolate(
    weatherData.wet_s1[currentDataIndex] || 0,
    weatherData.wet_s1[nextDataIndex] || 0
  );
  currentWeather.wetS2 = interpolate(
    weatherData.wet_s2[currentDataIndex] || 0,
    weatherData.wet_s2[nextDataIndex] || 0
  );
  currentWeather.wetS3 = interpolate(
    weatherData.wet_s3[currentDataIndex] || 0,
    weatherData.wet_s3[nextDataIndex] || 0
  );
  currentWeather.wetAvg = interpolate(
    weatherData.wet_avg[currentDataIndex] || 0,
    weatherData.wet_avg[nextDataIndex] || 0
  );

  // Check for significant rain changes and announce
  checkAndAnnounceRainChanges();
}

function checkAndAnnounceRainChanges() {
  const weatherRoom = (global as any).weatherRoom;
  if (!weatherRoom) return;

  const changes: string[] = [];

  // Check global rain change
  if (Math.abs(currentWeather.rainGlobal - lastRainGlobal) >= 10) {
    if (currentWeather.rainGlobal > lastRainGlobal) {
      changes.push(`🌧️ Chuva aumentando! Intensidade atual: ${currentWeather.rainGlobal.toFixed(0)}%`);
    } else {
      changes.push(`🌤️ Chuva diminuindo! Intensidade atual: ${currentWeather.rainGlobal.toFixed(0)}%`);
    }
    lastRainGlobal = currentWeather.rainGlobal;
  }

  // Check sector changes
  if (Math.abs(currentWeather.rainS1 - lastRainS1) >= 10) {
    changes.push(`📍 Setor 1: ${currentWeather.rainS1.toFixed(0)}% de chuva`);
    lastRainS1 = currentWeather.rainS1;
  }
  
  if (Math.abs(currentWeather.rainS2 - lastRainS2) >= 10) {
    changes.push(`📍 Setor 2: ${currentWeather.rainS2.toFixed(0)}% de chuva`);
    lastRainS2 = currentWeather.rainS2;
  }
  
  if (Math.abs(currentWeather.rainS3 - lastRainS3) >= 10) {
    changes.push(`📍 Setor 3: ${currentWeather.rainS3.toFixed(0)}% de chuva`);
    lastRainS3 = currentWeather.rainS3;
  }

  // Send announcements
  changes.forEach(message => {
    weatherRoom.sendAnnouncement(message);
  });
}