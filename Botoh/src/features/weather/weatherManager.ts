import { readFileSync } from "fs";
import { join } from "path";
import { currentWeather } from "./currentWeather";

let weatherData: any = null;
let weatherInterval: NodeJS.Timeout | null = null;
let startTime: number = 0;

export function startWeatherMonitoring(weatherId: string) {
  try {
    const weatherDir = join(__dirname, "..", "..", "weather");
    const dataPath = join(weatherDir, "weather_data", `weather_data_${weatherId}.json`);
    weatherData = JSON.parse(readFileSync(dataPath, "utf-8"));
    startTime = Date.now();

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

  const elapsedMinutes = (Date.now() - startTime) / 60000; // Convert to minutes
  const dataIndex = Math.floor(elapsedMinutes * 2); // 2 data points per minute

  if (dataIndex >= weatherData.time.length) {
    // Weather data ended, stop monitoring
    stopWeatherMonitoring();
    return;
  }

  currentWeather.rainGlobal = weatherData.rain_global[dataIndex] || 0;
  currentWeather.rainS1 = weatherData.rain_s1[dataIndex] || 0;
  currentWeather.rainS2 = weatherData.rain_s2[dataIndex] || 0;
  currentWeather.rainS3 = weatherData.rain_s3[dataIndex] || 0;
  currentWeather.wetS1 = weatherData.wet_s1[dataIndex] || 0;
  currentWeather.wetS2 = weatherData.wet_s2[dataIndex] || 0;
  currentWeather.wetS3 = weatherData.wet_s3[dataIndex] || 0;
  currentWeather.wetAvg = weatherData.wet_avg[dataIndex] || 0;
}