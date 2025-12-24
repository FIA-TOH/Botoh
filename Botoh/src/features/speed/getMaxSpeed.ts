import { CircuitPhysics } from "../../circuits/Circuit";
import { ACTUAL_CIRCUIT } from "../roomFeatures/stadiumChange";

export const BASE_MAX_SPEED = 94;

export function maxSpeedFromGrip(grip: number) {
  const Physics = ACTUAL_CIRCUIT.info.physicsType;

  let coef = 0;
  let intercept = 0;

  if (Physics === CircuitPhysics.F1_NEWGEN) {
    coef = 2451.5588;
    intercept = -2356.99881;
  } else if (Physics === CircuitPhysics.INDY) {
    coef = 18898.58;
    intercept = -18699.3803;
  } else {
    coef = 2451.5588;
    intercept = -2356.99881;
  }

  return coef * grip + intercept;
}
