// import { rainIntensity } from "../../rain/rain";
import { Tires } from "../../tires&pits/tires";
import { calculateGripMultiplier } from "./grip";

export function calculateGripForWetConditions(
  tyres: Tires,
  wear: number,
  norm: Number
) {
  if (!norm) return;
  const rainIntensity = 0; // Valor padrão quando a chuva não está ativada
  const normalizedRain = rainIntensity / 100;

  switch (tyres) {
    case "TRAIN":
    case "SOFT":
    case "MEDIUM":
    case "HARD": {
      // Decaimento linear de 0.001 a cada 10% de intensidade de chuva
      const rainImpact = Math.floor(normalizedRain / 0.1) * 0.001;
      const maxGrip = 0.998 - rainImpact;
      const minGrip = 0.995 - rainImpact;
      return calculateGripMultiplier(wear, norm, maxGrip, minGrip);
    }

    case "INTER": {
      if (normalizedRain <= 0.4) {
        return calculateGripMultiplier(wear, norm, 1, 0.995);
      } else {
        const rainImpact = Math.floor((normalizedRain - 0.4) / 0.1) * 0.001;
        const maxGrip = 1 - rainImpact;
        const minGrip = 0.995 - rainImpact;
        return calculateGripMultiplier(wear, norm, maxGrip, minGrip);
      }
    }

    case "WET": {
      if (normalizedRain >= 0.4) {
        return calculateGripMultiplier(wear, norm, 1, 0.995);
      } else {
        const rainImpact = Math.floor((0.4 - normalizedRain) / 0.1) * 0.001;
        const maxGrip = 1 - rainImpact;
        const minGrip = 0.995 - rainImpact;
        return calculateGripMultiplier(wear, norm, maxGrip, minGrip);
      }
    }

    case "FLAT":
      return 0.99;

    default:
      return;
  }
}
