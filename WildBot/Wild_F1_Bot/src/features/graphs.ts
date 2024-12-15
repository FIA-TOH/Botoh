// import { Tires } from "./tires";

// const MAX_GRIP = 100;

// function gripFloat(tires: Tires, rain: number) {
//     switch (tires) {
//         case Tires.WET:
//             return rain < 0.6 ? (rain + 0.4) * MAX_GRIP : MAX_GRIP;
//         case Tires.INTER:
//             return rain < 0.1 ? (5 * rain + 0.5) * MAX_GRIP : rain < 0.4 ? MAX_GRIP : rain < 0.6 ? (-5 * rain + 3) * MAX_GRIP : 0;
//         default:
//             return rain < 0.5 ? (4 * rain * rain - 4 * rain + 1) * MAX_GRIP : 0;
//     }
// }

// // function gripFloat(tires: Tires, rain: number) {
// //     switch (tires) {
// //         case Tires.WET:
// //             return rain === 0 ? 0 :
// //                 rain <= 0.5 ? (0.5 + rain) * (0.95 * MAX_GRIP) :
// //                     rain <= 0.8 ? 0.95 * MAX_GRIP :
// //                     0.95 - (rain - 0.8) * (0.95 - 0.8) / 0.2 * (0.95 * MAX_GRIP);

// //         case Tires.INTER:
// //             return MAX_GRIP

// //         default:
// //             return rain < 0.5 ? (4 * rain * rain - 4 * rain + 1) * MAX_GRIP : 0;
// //     }
// // }

// export function grip(tires: Tires, rain: number) {
//     return Math.round(gripFloat(tires, rain));
// }

// const RAIN_MIN_LOSS = 0
// const RAIN_MAX_LOSS = 0.5

// function rainWear(tires: Tires, rain: number) {
//     return 0;
//     switch (tires) {
//         case Tires.WET:
//             return rain < 0.3 ? RAIN_MAX_LOSS : rain < 0.7 ? ((RAIN_MIN_LOSS - RAIN_MAX_LOSS) / 0.4) * rain - 0.75 * RAIN_MIN_LOSS + 1.75 * RAIN_MAX_LOSS : RAIN_MIN_LOSS;

//         case Tires.INTER:
//             return rain < 0.2 ? (5 * RAIN_MIN_LOSS - 5 * RAIN_MAX_LOSS) * rain + RAIN_MAX_LOSS : rain < 0.4 ? RAIN_MIN_LOSS : (5 * RAIN_MAX_LOSS / 9 - RAIN_MIN_LOSS / 0.9) * rain + 13 * RAIN_MIN_LOSS / 9 - 2 * RAIN_MAX_LOSS / 9;

//         default:
//             return rain < 0.3 ? (RAIN_MAX_LOSS - RAIN_MIN_LOSS) * rain * 10 / 3 + RAIN_MIN_LOSS : RAIN_MAX_LOSS;
//     }
// }

// function lapWear(tires: Tires, lapsOnCurrentTires: number) {
//     switch (tires) {
//         case Tires.WET:
//             switch (lapsOnCurrentTires) {
//                 case 0:
//                     return -0.5;
//                 case 1:
//                     return -0.1;
//                 case 2:
//                     return 0.0;
//                 case 3:
//                     return 0.0;
//                 default:
//                     return 0.1;
//             }
//         case Tires.INTER:
//             switch (lapsOnCurrentTires) {
//                 case 0:
//                     return -0.5;
//                 case 1:
//                     return -0.1;
//                 case 2:
//                     return 0.0;
//                 case 3:
//                     return 0.0;
//                 default:
//                     return 0.1;
//             }
//         case Tires.HARD:
//             switch (lapsOnCurrentTires) {
//                 case 0:
//                     return -0.5;
//                 case 1:
//                     return -0.1;
//                 case 2:
//                     return 0.0;
//                 case 3:
//                     return 0.0;
//                 default:
//                     if (lapsOnCurrentTires < 19) return 0.1; else return 0.5;
//             }
//         case Tires.MEDIUM:
//             switch (lapsOnCurrentTires) {
//                 case 0:
//                     return -0.5;
//                 case 1:
//                     return -0.1;
//                 case 2:
//                     return 0.0;
//                 case 3:
//                     return 0.0;
//                 default:
//                     if (lapsOnCurrentTires < 14) return 0.125; else return 0.5;
//             }
//         default: //Tires.SOFT
//             switch (lapsOnCurrentTires) {
//                 case 0:
//                     return -0.5;
//                 case 1:
//                     return -0.1;
//                 case 2:
//                     return 0.0;
//                 case 3:
//                     return 0.0;
//                 default:
//                     if (lapsOnCurrentTires < 11) return 0.2; else return 0.5;
//             }
//     }
// }

// export function wear(tires: Tires, rain: number, lapsOnCurrentTires: number) {
//     if (lapsOnCurrentTires < 0) return 0;
//     return rainWear(tires, rain) + lapWear(tires, lapsOnCurrentTires);
// }