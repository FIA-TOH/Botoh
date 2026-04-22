import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { sendCyanMessage } from '../../chat/chat';
import { MESSAGES } from '../../chat/messages';

interface WeatherReport {
  time: string;
  id: string;
  meta?: {
    rain?: number;
    wet?: number;
  };
}

interface WeatherReportData {
  reports: WeatherReport[];
  lastReportIndex: number;
  weatherId: string;
}

let weatherReportData: WeatherReportData = {
  reports: [],
  lastReportIndex: 0,
  weatherId: ''
};

let initialAnnouncementShown = false;

function getWeatherMessage(id: string, meta?: { rain?: number; wet?: number }) {
  const weatherMessages: { [key: string]: { en: string; es: string; fr: string; tr: string; pt: string } } = {
    'CLEAR_START': MESSAGES.CLEAR_START(),
    'RAIN_ALREADY_STARTED': MESSAGES.RAIN_ALREADY_STARTED(),
    'TRACK_ALREADY_WET': MESSAGES.TRACK_ALREADY_WET(),
    'RAIN_STARTED': MESSAGES.RAIN_STARTED(),
    'RAIN_STOPPED': MESSAGES.RAIN_STOPPED(),
    'TRACK_WET': MESSAGES.TRACK_WET(),
    'TRACK_DRY': MESSAGES.TRACK_DRY(),
    'CLOUDS_FORMING': MESSAGES.CLOUDS_FORMING(),
    'RAIN_IN_1_MIN': MESSAGES.RAIN_IN_1_MIN(),
    'RAIN_STOPPING_1_MIN': MESSAGES.RAIN_STOPPING_1_MIN(),
    'RAIN_INTENSIFYING': MESSAGES.RAIN_INTENSIFYING(),
    'RAIN_WEAKENING': MESSAGES.RAIN_WEAKENING(),
    'SECTOR_DIFFERENCE': MESSAGES.SECTOR_DIFFERENCE()
  };
  
  let message = weatherMessages[id] || { en: id, es: id, fr: id, tr: id, pt: id };
  
  if (meta) {
    if (meta.rain !== undefined) {
      message = {
        en: `${message.en} (${meta.rain.toFixed(0)}%)`,
        es: `${message.es} (${meta.rain.toFixed(0)}%)`,
        fr: `${message.fr} (${meta.rain.toFixed(0)}%)`,
        tr: `${message.tr} (${meta.rain.toFixed(0)}%)`,
        pt: `${message.pt} (${meta.rain.toFixed(0)}%)`,
      };
    }
    if (meta.wet !== undefined) {
      message = {
        en: `${message.en} (${meta.wet.toFixed(0)}% wet)`,
        es: `${message.es} (${meta.wet.toFixed(0)}% mojado)`,
        fr: `${message.fr} (${meta.wet.toFixed(0)}% mouillé)`,
        tr: `${message.tr} (${meta.wet.toFixed(0)}% ıslak)`,
        pt: `${message.pt} (${meta.wet.toFixed(0)}% molhado)`,
      };
    }
  }
  
  return message;
}

function timeToSeconds(timeStr: string): number {
  const [minutes, seconds] = timeStr.split(':').map(Number);
  return minutes * 60 + seconds;
}

function loadWeatherReport(weatherId: string): boolean {
  const reportPath = join(__dirname, '..', 'weather_data', `weather_report_${weatherId}.json`);
  
  if (!existsSync(reportPath)) {
    console.error(`[Weather] Arquivo não encontrado: ${reportPath}`);
    return false;
  }
  
  try {
    const reportData = JSON.parse(readFileSync(reportPath, 'utf-8'));
    weatherReportData = {
      reports: reportData,
      lastReportIndex: 0,
      weatherId: weatherId
    };
    return true;
  } catch (error) {
    console.error(`[Weather] Erro ao ler JSON: ${error}`);
    return false;
  }
}

export function sendInitialWeatherAnnouncement(weatherId: string, room: any): void {
  if (!loadWeatherReport(weatherId)) return;
  
  weatherReportData.lastReportIndex = 0;
  initialAnnouncementShown = true;
  
  // Check for events at 00:00
  const report = weatherReportData.reports.find(r => r.time === "00:00");
  if (report) {
    const message = getWeatherMessage(report.id, report.meta);
    sendCyanMessage(room, message);
    console.log(`[Weather] Initial announcement: ${message.pt || message.en}`);
  }
}

export function checkWeatherReportAnnouncements(currentTime: number, weatherId: string, room: any): void {
  // Skip processing at time 0 - initial announcement is handled by sendInitialWeatherAnnouncement
  if (currentTime === 0) return;
  
  // Reset index when weather changes
  if (weatherReportData.weatherId !== weatherId) {
    if (!loadWeatherReport(weatherId)) return;
    weatherReportData.lastReportIndex = 0;
    console.log(`[Weather] Reset index for weatherId: ${weatherId}`);
  }
  
  const minutes = Math.floor(currentTime / 60);
  const seconds = Math.floor(currentTime % 60);
  const currentTimeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  for (let i = weatherReportData.lastReportIndex; i < weatherReportData.reports.length; i++) {
    const report = weatherReportData.reports[i];
    
    if (report.time === currentTimeStr) {
      const message = getWeatherMessage(report.id, report.meta);
      
      sendCyanMessage(room, message);
      console.log(`[Weather] ${currentTimeStr}: ${message.pt || message.en}`);
      
      weatherReportData.lastReportIndex = i + 1;
      break; 
    }
    
    // Pula eventos que já ficaram para trás (evita spam ao carregar)
    if (timeToSeconds(report.time) < currentTime) {
      weatherReportData.lastReportIndex = i + 1;
    }
  }
}

export function resetWeatherReportAnnouncements(): void {
  weatherReportData = {
    reports: [],
    lastReportIndex: 0,
    weatherId: ''
  };
  initialAnnouncementShown = false;
}