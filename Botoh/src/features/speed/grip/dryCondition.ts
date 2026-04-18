import { Tires, tyresActivated } from "../../tires&pits/tires";
import { laps } from "../../zones/laps";
import { constants } from "../constants";
import { currentWeather } from "../../weather/currentWeather";

import { calculateGripMultiplier } from "./grip";

// Função para calcular grip dinâmico baseado na chuva
function calculateDynamicGripForRain(
  baseGrip: number,
  rainPercent: number,
  maxRainPercent: number,
  maxGrip: number
): number {
  if (rainPercent <= 0) return baseGrip;
  if (rainPercent >= maxRainPercent) return maxGrip;
  
  // Interpolação linear entre baseGrip e maxGrip
  const ratio = rainPercent / maxRainPercent;
  return baseGrip + (maxGrip - baseGrip) * ratio;
}

export function calculateGripForDryConditions(
  tyres: Tires,
  wear: number,
  norm: Number,
) {
  if (!norm) return;
  if (laps >= 15) {
    switch (tyres) {
      case "SOFT":
        return calculateGripMultiplier(wear, norm, 1.0, 0.993);
      case "MEDIUM":
        return calculateGripMultiplier(wear, norm, 0.9999, 0.994);
      case "HARD":
        return calculateGripMultiplier(wear, norm, 0.9998, 0.995);
      case "INTER": {
        // INTER: 0-10% chuva vai de 0.9996 a 0.9999
        const dynamicGrip = calculateDynamicGripForRain(0.9996, currentWeather.rainGlobal, 10, 0.9999);
        return calculateGripMultiplier(wear, norm, dynamicGrip, 0.994);
      }
      case "WET": {
        // WET: 0-30% chuva vai de 0.9992 a 0.9998
        const dynamicGrip = calculateDynamicGripForRain(0.9992, currentWeather.rainGlobal, 30, 0.9998);
        return calculateGripMultiplier(wear, norm, dynamicGrip, 0.995);
      }
      case "FLAT":
        return 0.99;
      case "TRAIN":
        return 1.0;
    }
  } else {
    switch (tyres) {
      case "SOFT":
        return calculateGripMultiplier(wear, norm, 1.0, 0.996);
      case "MEDIUM":
        return calculateGripMultiplier(wear, norm, 0.99975, 0.9965);
      case "HARD":
        return calculateGripMultiplier(wear, norm, 0.9995, 0.997);
      case "INTER": {
        // INTER: 0-10% chuva vai de 0.998 a 0.9999 (ajustando base para laps < 15)
        const dynamicGrip = calculateDynamicGripForRain(0.998, currentWeather.rainGlobal, 10, 0.9999);
        return calculateGripMultiplier(wear, norm, dynamicGrip, 0.995);
      }
      case "WET": {
        // WET: 0-30% chuva vai de 0.997 a 0.9998 (ajustando base para laps < 15)
        const dynamicGrip = calculateDynamicGripForRain(0.997, currentWeather.rainGlobal, 30, 0.9998);
        return calculateGripMultiplier(wear, norm, dynamicGrip, 0.994);
      }
      case "FLAT":
        return 0.99;
      case "TRAIN":
        return 1.0;
    }
  }
}
