import { Tires } from "../tires&pits/tires";

const MAX_GRIP = 50;

function gripFloat(tires: Tires, rainIntensityGrip: number) {
  if (rainIntensityGrip <= 10) {
    return MAX_GRIP / 2;
  } else {
    switch (tires) {
      case Tires.WET:
        return 0;

      case Tires.INTER:
        return 0;

      default:
        return 0;
    }
  }
}

export function grip(tires: Tires, rainIntensityGrip: number) {
  return Math.round(gripFloat(tires, rainIntensityGrip));
}
