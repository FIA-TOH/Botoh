import { playerList } from "../changePlayerState/playerList";
import { randomInRange } from "../utils";

type PitTimeEntry = {
  time: number;
  prob: number;
};

export type PitResult = {
  totalTime: number;
  errorType: "none" | "light" | "heavy";
  tyres: number[];
  perTyreTimes: number[];
};
const PIT_TABLE: PitTimeEntry[] = [
  { time: 1.6, prob: 0.5 }, // ultra-rápido
  { time: 1.8, prob: 2 },
  { time: 2.0, prob: 5 },
  { time: 2.2, prob: 10 },
  { time: 2.4, prob: 15 },
  { time: 2.6, prob: 20 }, // pico de probabilidade
  { time: 2.8, prob: 15 },
  { time: 3.0, prob: 10 },
  { time: 3.5, prob: 5 }, // um pouco lento
  { time: 4.0, prob: 3 },
  { time: 5.0, prob: 2 }, // lento raro
  { time: 6.0, prob: 1 }, // muito raro
  { time: 8.0, prob: 0.5 }, // erros extremos
  { time: 10.0, prob: 0.2 }, // pit catastrófico
  // { time: 5.0, prob: 0.8 }, // ultra-rápido
  // { time: 5.2, prob: 3 },
  // { time: 5.4, prob: 6 },
  // { time: 5.6, prob: 11 },
  // { time: 5.8, prob: 16 },
  // { time: 6.0, prob: 21 }, // pico de probabilidade
  // { time: 6.2, prob: 16 },
  // { time: 6.5, prob: 11 },
  // { time: 7.0, prob: 6 }, // um pouco lento
  // { time: 8.0, prob: 4 },
  // { time: 9.0, prob: 3 }, // lento raro
  // { time: 10.0, prob: 1 }, // muito raro
  // { time: 12.0, prob: 0.8 }, // erros extremos
  // { time: 15.0, prob: 0.4 }, // pit catastrófico
];

export function generatePitCountdown(): number {
  const totalProb = PIT_TABLE.reduce((acc, entry) => acc + entry.prob, 0);

  const r = Math.random() * totalProb;

  let accumulated = 0;
  for (let i = 0; i < PIT_TABLE.length - 1; i++) {
    accumulated += PIT_TABLE[i].prob;
    if (r <= accumulated) {
      const start = PIT_TABLE[i];
      const end = PIT_TABLE[i + 1];

      const intervalProb = start.prob + end.prob;
      const t = (r - (accumulated - start.prob)) / intervalProb;

      const exponent = 2;
      const time = start.time + (end.time - start.time) * Math.pow(t, exponent);

      return Math.round(time * 100) / 100;
    }
  }

  return PIT_TABLE[PIT_TABLE.length - 1].time;
}
export function generatePitResult(player: PlayerObject): PitResult {
  const totalTime = generatePitCountdown();
  playerList[player.id].pitCountdown = totalTime;

  let errorType: PitResult["errorType"] = "none";
  const tyres: number[] = [];

  if (totalTime >= 3 && totalTime <= 6.0) {
    errorType = "light";
    tyres.push(Math.floor(Math.random() * 4));
  } else if (totalTime >= 6.1) {
    errorType = "heavy";
    const tyre1 = Math.floor(Math.random() * 4);
    tyres.push(tyre1);
    if (Math.random() < 0.5) {
      let tyre2 = tyre1;
      while (tyre2 === tyre1) tyre2 = Math.floor(Math.random() * 4);
      tyres.push(tyre2);
    }
  }

  const perTyreTimes = Array(4).fill(0);
  if (errorType === "none") {
    const bad = Math.floor(Math.random() * 4);

    let remaining = totalTime;
    for (let i = 0; i < 4; i++) {
      if (i === bad) continue;
      perTyreTimes[i] = randomInRange(0.3, 0.7);
      remaining -= perTyreTimes[i];
    }

    perTyreTimes[bad] = Math.max(0.4, remaining);
  } else if (errorType === "light") {
    const bad = tyres[0];
    let remaining = totalTime;

    for (let i = 0; i < 4; i++) {
      if (i === bad) continue;
      perTyreTimes[i] = randomInRange(0.4, 0.8);
      remaining -= perTyreTimes[i];
    }

    perTyreTimes[bad] = Math.max(1.5, remaining);
  } else {
    let remaining = totalTime;
    const badTyres = new Set(tyres);

    for (let i = 0; i < 4; i++) {
      if (badTyres.has(i)) continue;
      perTyreTimes[i] = randomInRange(0.4, 0.8);
      remaining -= perTyreTimes[i];
    }

    const share = remaining / tyres.length;
    for (const t of tyres) {
      perTyreTimes[t] = Math.max(1.5, share + randomInRange(-0.3, 0.3));
    }
  }
  return {
    totalTime,
    errorType,
    tyres,
    perTyreTimes: perTyreTimes.map((t) => Math.round(t * 100) / 100),
  };
}
