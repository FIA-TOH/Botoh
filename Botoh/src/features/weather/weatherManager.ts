import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { currentWeather } from "./currentWeather";

let lastRainGlobal: number = 0;
let lastRainS1: number = 0;
let lastRainS2: number = 0;
let lastRainS3: number = 0;

let weatherData: any = null;
let weatherInterval: NodeJS.Timeout | null = null;
let lastDataIndex: number = 0;
let interpolationProgress: number = 0;
let lastUpdateTime: number = 0;

export function startWeatherMonitoring(weatherId: string, room?: RoomObject) {
  try {
    const weatherDir = __dirname;
    const dataPath = join(weatherDir, "weather_data", `weather_${weatherId}.json`);
    
    if (!existsSync(dataPath)) {
      throw new Error(`Weather file not found: ${dataPath}`);
    }
    
    weatherData = JSON.parse(readFileSync(dataPath, "utf-8"));

    lastRainGlobal = 0;
    lastRainS1 = 0;
    lastRainS2 = 0;
    lastRainS3 = 0;

    if (room) {
      const gameScores = room.getScores();
      lastUpdateTime = gameScores ? gameScores.time : 0;
    } else {
      lastUpdateTime = 0;
    }

    console.log(`Weather monitoring started for ID: ${weatherId}`);
  } catch (error) {
    console.error("Failed to start weather monitoring:", error);
  }
}

export function checkWeatherUpdate(room: RoomObject) {
  if (!weatherData) return;

  if (!room) return;

  const gameScores = room.getScores();
  if (!gameScores || gameScores.time === undefined) return;

  updateCurrentWeather(room);
  
  checkAndAnnounceRainChanges(room);
  
  if (gameScores.time - lastUpdateTime >= 30) {
    lastUpdateTime = gameScores.time;
  }
}

export function stopWeatherMonitoring() {
  if (weatherInterval) {
    clearInterval(weatherInterval);
    weatherInterval = null;
  }
  weatherData = null;
  lastUpdateTime = 0;
  
  Object.keys(currentWeather).forEach(key => {
    (currentWeather as any)[key] = 0;
  });
  console.log("Weather monitoring stopped");
}

function updateCurrentWeather(room: RoomObject) {
  if (!weatherData) return;

  if (!room) return;
  
  const gameScores = room.getScores();
  if (!gameScores || gameScores.time === undefined) return;
  
  const elapsedMinutes = gameScores.time / 60;

  const exactDataIndex = elapsedMinutes * 2;
  const currentDataIndex = Math.floor(exactDataIndex);
  const fraction = exactDataIndex - currentDataIndex;

  if (currentDataIndex >= weatherData.time.length - 1) {
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

  checkAndAnnounceRainChanges(room);
}

function checkAndAnnounceRainChanges(room: RoomObject) {
  if (!room) return;

  const currentRain = currentWeather.rainGlobal;
  let shouldAnnounce = false;
  let message = "";

  if (Math.abs(currentRain - lastRainGlobal) >= 20) {
    shouldAnnounce = true;
    message = `\ud83c\udf27\ufe0f Chuva: ${currentRain.toFixed(0)}%`;
    lastRainGlobal = currentRain;
  }
  else if (currentRain === 0 && lastRainGlobal !== 0) {
    shouldAnnounce = true;
    message = `\ud83c\udf27\ufe0f Chuva: 0%`;
    lastRainGlobal = currentRain;
  }
  else if (currentRain === 100 && lastRainGlobal !== 100) {
    shouldAnnounce = true;
    message = `\ud83c\udf27\ufe0f Chuva: 100%`;
    lastRainGlobal = currentRain;
  }

  if (shouldAnnounce && message) {
    room.sendAnnouncement(message);
  }
}