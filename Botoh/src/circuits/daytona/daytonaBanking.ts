import { BankingZone } from "../Circuit";

const bottom: [number, number] = [-2874.449378820837, -3102.6847891408274];
const top: [number, number] = [-3341.8241155399764, -1192.138867821734];

// Reversing these vertices requires -150 to preserve the left-hand HBS arc.
export const DAYTONA_BANKING: BankingZone[] = [{
  id: "final-left",
  baseArc: { v0: top, v1: bottom, curve: 150 },
  detectors: [
    { v0: top, v1: [-3455, -1038] },
    { v0: bottom, v1: [-2879.28, -3283.2000000000003] },
  ],
  maxDrag: 0.001955,
  falloffDistance: 150,
}, {
  id: "oval-right",
  baseArc: {
    v0: [3402.0302780551947, -1211.1418740147788],
    v1: [2879.2487661043237, -3103.8497875211096],
    curve: -147.38857031718157,
  },
  detectors: [
    { v0: [2879, -3304], v1: [2879.2487661043237, -3103.8497875211096] },
    { v0: [3402.0302780551947, -1211.1418740147788], v1: [3521, -1056] },
  ],
  maxDrag: 0.001955,
  falloffDistance: 150,
}];
