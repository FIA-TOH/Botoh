
import { Tires } from "./tires";

const MAX_GRIP = 50;

function gripFloat(tires: Tires, rainIntensityGrip: number) {

    switch (tires) {
        case Tires.WET:
            // De 0 a 30%: Linear crescente de MAX_GRIP/2 até MAX_GRIP
            if (rainIntensityGrip <= 30) {
                return (MAX_GRIP / 2) + (rainIntensityGrip / 30) * (MAX_GRIP / 2);
            }
            // De 30 a 75%: Linear decrescente de MAX_GRIP até 0
            if (rainIntensityGrip <= 75) {
                return MAX_GRIP - ((rainIntensityGrip - 30) / 45) * MAX_GRIP;
            }
            // De 75 a 100%: Grip é 0
            return 0;

        case Tires.INTER:
            // De 0 a 10%: Linear crescente de MAX_GRIP/2 até MAX_GRIP
            if (rainIntensityGrip <= 10) {
                return (MAX_GRIP / 2) + (rainIntensityGrip / 10) * (MAX_GRIP / 2);
            }
            // De 10 a 50%: Linear decrescente de MAX_GRIP até 0
            if (rainIntensityGrip <= 50) {
                return MAX_GRIP - ((rainIntensityGrip - 10) / 40) * MAX_GRIP;
            }
            // De 50 a 100%: Grip é 0
            return 0;

        default: 
            // De 0 a 30%: Linear decrescente de MAX_GRIP até 0
            if (rainIntensityGrip <= 30) {
                return MAX_GRIP - (rainIntensityGrip / 30) * MAX_GRIP;
            }
            // De 30 a 100%: Grip é 0
            return 0;

    }
}

export function grip(tires: Tires, rainIntensityGrip: number) {
    return Math.round(gripFloat(tires, rainIntensityGrip));
}