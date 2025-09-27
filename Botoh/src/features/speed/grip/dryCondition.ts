import { Tires } from "../../tires&pits/tires";
import { laps } from "../../zones/laps";

import { calculateGripMultiplier } from "./grip";

export function calculateGripForDryConditions(
  tyres: Tires,
  wear: number,
  norm: Number
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
      case "INTER":
        return calculateGripMultiplier(wear, norm, 0.998, 0.995);
      case "WET":
        return calculateGripMultiplier(wear, norm, 0.997, 0.994);
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
      case "INTER":
        return calculateGripMultiplier(wear, norm, 0.998, 0.995);
      case "WET":
        return calculateGripMultiplier(wear, norm, 0.997, 0.994);
      case "FLAT":
        return 0.99;
      case "TRAIN":
        return 1.0;
    }
  }
}
