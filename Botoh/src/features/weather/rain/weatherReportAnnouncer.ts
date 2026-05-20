import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { sendCyanMessage } from '../../chat/chat';
import { MESSAGES } from '../../chat/messages';
import { isRealisticRainAnnouncerEnabled } from './realisticRainAnnouncer';

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

interface WeatherSeriesData {
  time: number[];
  rain_global: number[];
}

export interface LastWeatherAnnouncement {
  id: string;
  message: {
    en: string;
    es: string;
    fr: string;
    tr: string;
    pt: string;
  };
  announcedAtGameTime: number;
  announcedAtTimestamp: number;
}

export interface RealisticWeatherAnnouncement extends LastWeatherAnnouncement {
  weatherLevel: number;
  eventGameTime: number;
  displayedEventGameTime: number;
  isEstimated: boolean;
  intensity?: {
    type: 'max' | 'min';
    value: number;
  };
}

let weatherReportData: WeatherReportData = {
  reports: [],
  lastReportIndex: 0,
  weatherId: ''
};

let initialAnnouncementShown = false;
let lastWeatherAnnouncement: LastWeatherAnnouncement | null = null;
let weatherSeriesData: WeatherSeriesData | null = null;

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

function clampWeatherLevel(level: number): number {
  if (!Number.isFinite(level)) return 0;
  return Math.max(0, Math.min(5, Math.floor(level)));
}

function getForecastLeadTime(level: number): number {
  if (level >= 5) return 180;
  if (level >= 4) return 120;
  if (level >= 3) return 60;
  if (level >= 1) return 180;
  return 0;
}

function getForecastErrorRange(level: number): number {
  if (level === 1) return 120;
  if (level === 2) return 60;
  return 0;
}

function getDeterministicForecastError(report: WeatherReport, level: number): number {
  const range = getForecastErrorRange(level);
  if (range === 0) return 0;

  const seed = `${weatherReportData.weatherId}:${report.time}:${report.id}:${level}`;
  let hash = 0;
  for (let index = 0; index < seed.length; index++) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return (hash % (range * 2 + 1)) - range;
}

function getIntensityType(reportId: string): 'max' | 'min' | null {
  if (
    reportId === 'RAIN_STARTED'
    || reportId === 'RAIN_ALREADY_STARTED'
    || reportId === 'CLOUDS_FORMING'
    || reportId === 'RAIN_IN_1_MIN'
    || reportId === 'RAIN_INTENSIFYING'
  ) {
    return 'max';
  }

  if (
    reportId === 'RAIN_STOPPED'
    || reportId === 'RAIN_STOPPING_1_MIN'
    || reportId === 'RAIN_WEAKENING'
    || reportId === 'TRACK_DRY'
  ) {
    return 'min';
  }

  return null;
}

function getRainIntensity(type: 'max' | 'min', startTime: number, eventTime: number): number | null {
  if (!weatherSeriesData) return null;

  const fromMinute = Math.max(0, Math.min(startTime, eventTime) / 60);
  const toMinute = Math.max(fromMinute, eventTime / 60 + 3);
  const values = weatherSeriesData.time
    .map((time, index) => ({ time, rain: weatherSeriesData?.rain_global[index] ?? 0 }))
    .filter(({ time }) => time >= fromMinute && time <= toMinute)
    .map(({ rain }) => rain);

  if (values.length === 0) return null;
  return type === 'max' ? Math.max(...values) : Math.min(...values);
}

function isReportRelevantForForecast(report: WeatherReport): boolean {
  return report.id !== 'CLEAR_START' && report.id !== 'TRACK_ALREADY_WET';
}

function loadWeatherReport(weatherId: string): boolean {
  const reportPath = join(__dirname, '..', 'weather_data', `weather_report_${weatherId}.json`);
  const dataPath = join(__dirname, '..', 'weather_data', `weather_${weatherId}.json`);
  
  if (!existsSync(reportPath)) {
    console.error(`[Weather] File not found: ${reportPath}`);
    return false;
  }
  
  try {
    const reportData = JSON.parse(readFileSync(reportPath, 'utf-8'));
    weatherReportData = {
      reports: reportData,
      lastReportIndex: 0,
      weatherId: weatherId
    };
    weatherSeriesData = existsSync(dataPath)
      ? JSON.parse(readFileSync(dataPath, 'utf-8'))
      : null;
    return true;
  } catch (error) {
    console.error(`[Weather] Error reading JSON: ${error}`);
    return false;
  }
}

export function sendInitialWeatherAnnouncement(weatherId: string, room: any): void {
  if (!loadWeatherReport(weatherId)) return;
  
  weatherReportData.lastReportIndex = 0;
  initialAnnouncementShown = true;
  
  const report = weatherReportData.reports.find(r => r.time === "00:00");
  if (report) {
    const message = getWeatherMessage(report.id, report.meta);
    lastWeatherAnnouncement = {
      id: report.id,
      message,
      announcedAtGameTime: 0,
      announcedAtTimestamp: Date.now(),
    };
    if (!isRealisticRainAnnouncerEnabled()) {
      sendCyanMessage(room, message);
    }
    console.log(`[Weather] Initial announcement: ${message.pt || message.en}`);
  }
}

export function checkWeatherReportAnnouncements(currentTime: number, weatherId: string, room: any): void {
  if (currentTime === 0) return;
  
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
      lastWeatherAnnouncement = {
        id: report.id,
        message,
        announcedAtGameTime: currentTime,
        announcedAtTimestamp: Date.now(),
      };
      
      if (!isRealisticRainAnnouncerEnabled()) {
        sendCyanMessage(room, message);
      }
      console.log(`[Weather] ${currentTimeStr}: ${message.pt || message.en}`);
      
      weatherReportData.lastReportIndex = i + 1;
      break; 
    }
    
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
  lastWeatherAnnouncement = null;
  weatherSeriesData = null;
}

export function getLastWeatherAnnouncement(): LastWeatherAnnouncement | null {
  return lastWeatherAnnouncement;
}

export function getRealisticWeatherAnnouncement(
  weatherLevel: number,
  currentGameTime: number,
): RealisticWeatherAnnouncement | null {
  const level = clampWeatherLevel(weatherLevel);
  if (!isRealisticRainAnnouncerEnabled() || level <= 0) return null;

  const leadTime = getForecastLeadTime(level);
  const nextReport = weatherReportData.reports.find((report) => {
    if (!isReportRelevantForForecast(report)) return false;
    const eventTime = timeToSeconds(report.time);
    return eventTime >= currentGameTime && eventTime - currentGameTime <= leadTime;
  });

  if (!nextReport) return null;

  const eventGameTime = timeToSeconds(nextReport.time);
  const displayedEventGameTime = Math.max(
    0,
    eventGameTime + getDeterministicForecastError(nextReport, level),
  );
  const message = getWeatherMessage(nextReport.id, nextReport.meta);
  const intensityType = level >= 5 ? getIntensityType(nextReport.id) : null;
  const intensityValue = intensityType
    ? getRainIntensity(intensityType, currentGameTime, eventGameTime)
    : null;

  return {
    id: nextReport.id,
    message,
    weatherLevel: level,
    eventGameTime,
    displayedEventGameTime,
    isEstimated: level <= 2,
    announcedAtGameTime: currentGameTime,
    announcedAtTimestamp: Date.now(),
    intensity: intensityType && intensityValue !== null
      ? {
          type: intensityType,
          value: intensityValue,
        }
      : undefined,
  };
}
