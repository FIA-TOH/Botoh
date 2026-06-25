// =========================
// INSTALLATION
// =========================
// npm init -y
// npm install simplex-noise chartjs-node-canvas canvas

const fs = require("fs");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const { createNoise2D } = require("simplex-noise");

function simulateWeather(rainProbabilityPercent, raceMinutes) {
  const warmupMinutes = raceMinutes > 0 ? Math.floor(raceMinutes / 2) : 10;
  const totalSimMinutes = raceMinutes + warmupMinutes;
  const steps = totalSimMinutes * 60;
  const probability = Math.max(0, Math.min(100, rainProbabilityPercent));
  const climate = probability / 100;
  const shouldRainDuringRace = Math.random() < climate;
  const shouldStartWetOrRaining = shouldRainDuringRace && Math.random() < climate * 0.35;
  const raceStartSecond = warmupMinutes * 60;

  const noise2D = createNoise2D();
  const seed = Math.random() * 1000;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const randomBetween = (min, max) => min + Math.random() * (max - min);
  const smoothStep = (value) => {
    const x = clamp(value, 0, 1);
    return x * x * (3 - 2 * x);
  };
  const moveToward = (current, target, amount) => {
    if (target > current) return Math.min(target, current + amount);
    if (target < current) return Math.max(target, current - amount);
    return current;
  };
  const chooseWeighted = (items) => {
    const total = items.reduce((sum, item) => sum + item.weight, 0);
    let roll = Math.random() * total;

    for (const item of items) {
      roll -= item.weight;
      if (roll <= 0) return item.value;
    }

    return items[items.length - 1].value;
  };

  let rainGlobal = 0;
  const sectorRain = [0, 0, 0];
  const sectorWet = [0, 0, 0];
  const sectorRainAccumulated = [0, 0, 0];
  const sectorOutputOrder = Math.random() < 0.5
    ? [0, 1, 2]
    : [2, 1, 0];
  if (Math.random() < 0.33) {
    sectorOutputOrder.push(sectorOutputOrder.shift());
  } else if (Math.random() < 0.50) {
    sectorOutputOrder.unshift(sectorOutputOrder.pop());
  }
  const getWetLimitMultiplier = () => 1.05 + ((Math.random() + Math.random()) / 2) * 0.10;
  const wetLimitMultipliers = [
    getWetLimitMultiplier(),
    getWetLimitMultiplier(),
    getWetLimitMultiplier(),
  ];

  let activeSystems = [];
  let nextSystemCheckSecond = 0;
  let previousTargetWasRain = false;
  let transitionRateMultiplier = 1;
  let nextEdgePreference = Math.random() < 0.5 ? -1 : 1;

  const data = {
    time: [],
    rain_global: [],
    rain_s1: [],
    rain_s2: [],
    rain_s3: [],
    wet_s1: [],
    wet_s2: [],
    wet_s3: [],
    wet_avg: []
  };

  const createSystem = (startSecond, forced = false) => {
    const type = forced
      ? chooseWeighted([
          { value: "drizzle", weight: 30 },
          { value: "shower", weight: 38 },
          { value: "front", weight: 31 },
          { value: "burst", weight: 0.3 },
        ])
      : chooseWeighted([
          { value: "drizzle", weight: 36 },
          { value: "shower", weight: 38 },
          { value: "front", weight: 25 },
          { value: "burst", weight: 0.3 },
        ]);

    const profile = {
      drizzle: { duration: [720, 1800], intensity: [12, 42], footprint: [1.10, 1.80], speed: [0.0002, 0.0010] },
      shower: { duration: [720, 1500], intensity: [30, 78], footprint: [0.95, 1.60], speed: [0.0004, 0.0018] },
      front: { duration: [1200, 2700], intensity: [34, 92], footprint: [1.35, 2.10], speed: [0.0001, 0.0008] },
      burst: { duration: [540, 900], intensity: [50, 100], footprint: [0.95, 1.35], speed: [0.0006, 0.0015] },
    }[type];

    const duration = randomBetween(profile.duration[0], profile.duration[1]);
    const maxIntensity = clamp(randomBetween(profile.intensity[0], profile.intensity[1]) * (0.75 + climate * 0.95), 4, 100);
    const direction = Math.random() < 0.5 ? -1 : 1;

    const edgeBiased = type !== "front" && Math.random() < 0.35;
    const center = edgeBiased
      ? (nextEdgePreference < 0 ? randomBetween(-0.25, 0.75) : randomBetween(1.25, 2.25))
      : randomBetween(0.25, 1.75);
    nextEdgePreference *= -1;

    return {
      type,
      startSecond,
      endSecond: startSecond + duration,
      duration,
      maxIntensity,
      rampInEnd: type === "burst" ? randomBetween(0.24, 0.36) : randomBetween(0.32, 0.48),
      rampOutStart: type === "front" ? randomBetween(0.82, 0.94) : randomBetween(0.76, 0.92),
      rampOutDuration: type === "burst" ? randomBetween(0.22, 0.34) : randomBetween(0.26, 0.42),
      waveCount: type === "front" ? randomBetween(0.60, 1.10) : randomBetween(0.85, 1.85),
      footprint: randomBetween(profile.footprint[0], profile.footprint[1]),
      center,
      driftPerSecond: direction * randomBetween(profile.speed[0], profile.speed[1]),
      wobble: randomBetween(0.03, 0.20),
      favoredSector: Math.floor(Math.random() * 3),
      sectorBiasStrength: type === "burst" ? randomBetween(0.06, 0.16) : randomBetween(0.02, 0.08),
      phase: Math.random() * Math.PI * 2,
      pulseStrength: type === "front" ? randomBetween(1, 4) : randomBetween(3, 10),
      noiseOffset: Math.random() * 1000,
    };
  };

  const getSystemStrength = (system, currentSecond) => {
    const age = currentSecond - system.startSecond;
    const life = clamp(age / system.duration, 0, 1);
    const entrance = smoothStep(life / system.rampInEnd);
    const exit = 1 - smoothStep((life - system.rampOutStart) / system.rampOutDuration);
    const envelope = clamp(entrance * exit, 0, 1);
    const longWave = Math.sin(life * Math.PI * system.waveCount + system.phase);
    const noise = noise2D(currentSecond * 0.003 + seed + system.noiseOffset, system.phase);
    const pulse = Math.max(0, longWave) * system.pulseStrength;

    return clamp((system.maxIntensity + pulse + noise * 4) * envelope, 0, 100);
  };

  if (shouldRainDuringRace && Math.random() < climate * 0.70) {
    const initialSystem = createSystem(0, true);
    const initialMinAge = initialSystem.duration * Math.min(0.55, initialSystem.rampInEnd + 0.08);
    const initialMaxAge = initialSystem.duration * Math.max(initialMinAge / initialSystem.duration, Math.min(0.68, initialSystem.rampOutStart - 0.16));
    initialSystem.startSecond = raceStartSecond - randomBetween(initialMinAge, initialMaxAge);
    initialSystem.endSecond = initialSystem.startSecond + initialSystem.duration;
    initialSystem.center = randomBetween(0.60, 1.40);
    initialSystem.driftPerSecond = randomBetween(-0.00025, 0.00025);
    initialSystem.wobble = randomBetween(0.02, 0.08);
    initialSystem.footprint = Math.max(initialSystem.footprint, randomBetween(1.25, 1.75));
    activeSystems.push(initialSystem);
  }

  for (let t = 0; t < steps; t++) {
    const slowHumidity = (noise2D(t * 0.00045 + seed, 11) + 1) / 2;
    const instability = (noise2D(t * 0.0012 + seed, 23) + 1) / 2;
    const triggerPotential = climate * 0.62 + slowHumidity * 0.28 + instability * 0.20;

    activeSystems = activeSystems.filter((system) => t <= system.endSecond);

    if (shouldRainDuringRace && t >= nextSystemCheckSecond) {
      const warmupBoost = t < raceStartSecond ? 0.22 : 0;
      const activePenalty = activeSystems.length > 0 ? 0.16 : 0;
      const spawnChance = clamp((triggerPotential - 0.38 - activePenalty + warmupBoost) * 0.28, 0.002, 0.26);

      if (Math.random() < spawnChance) {
        const startOffset = Math.random() < 0.20 ? -randomBetween(30, 180) : 0;
        activeSystems.push(createSystem(t + startOffset));
      }

      nextSystemCheckSecond = t + randomBetween(20, 75);
    }

    const targetSectorRain = [0, 0, 0];
    for (const system of activeSystems) {
      const strength = getSystemStrength(system, t);
      const elapsed = t - system.startSecond;
      const center = system.center + system.driftPerSecond * elapsed + Math.sin(t * 0.003 + system.phase) * system.wobble;

      for (let sector = 0; sector < 3; sector++) {
        const distance = Math.abs(sector - center);
        const coreCoverage = clamp(1 - distance / system.footprint, 0, 1);
        const diffuseCoverage = system.type === "burst" ? 0.06 : 0.16;
        const coverage = strength > 3 ? diffuseCoverage + coreCoverage * (1 - diffuseCoverage) : coreCoverage;
        const cellNoise = (noise2D(t * 0.010 + seed + sector * 37, system.noiseOffset + sector) + 1) / 2;
        const microCell = 0.95 + cellNoise * 0.10;
        const sectorBias = sector === system.favoredSector
          ? 1 + system.sectorBiasStrength
          : 1 - system.sectorBiasStrength / 2;
        targetSectorRain[sector] += strength * coverage * microCell * sectorBias;
      }
    }

    const targetAvgBeforeMix = targetSectorRain.reduce((sum, value) => sum + value, 0) / 3;
    const targetMaxBeforeMix = Math.max(...targetSectorRain);
    if (targetMaxBeforeMix > 6) {
      const hasBurst = activeSystems.some((system) => system.type === "burst");
      const mixToAverage = hasBurst ? 0.30 : 0.55;
      const floorRatio = hasBurst ? 0.45 : 0.68;
      const accumulatedAvg = sectorRainAccumulated.reduce((sum, value) => sum + value, 0) / 3;

      for (let sector = 0; sector < 3; sector++) {
        const balanceBoost = accumulatedAvg > 0 && sectorRainAccumulated[sector] < accumulatedAvg * 0.82
          ? 1.08
          : 1;
        targetSectorRain[sector] = Math.max(targetSectorRain[sector], targetMaxBeforeMix * floorRatio);
        targetSectorRain[sector] = targetSectorRain[sector] * (1 - mixToAverage) + targetAvgBeforeMix * mixToAverage;
        targetSectorRain[sector] *= balanceBoost;
      }
    }

    const targetRainAvg = targetSectorRain.reduce((sum, value) => sum + clamp(value, 0, 100), 0) / 3;
    const targetRainMax = Math.max(...targetSectorRain);
    const targetRainGlobal = targetRainMax * 0.82 + targetRainAvg * 0.18;
    const targetIsRain = targetRainGlobal > 0.5;
    if (targetIsRain !== previousTargetWasRain) {
      transitionRateMultiplier = Math.random() < 0.015
        ? randomBetween(1.4, 2.2)
        : randomBetween(0.55, 1.00);
      previousTargetWasRain = targetIsRain;
    }

    for (let sector = 0; sector < 3; sector++) {
      const target = clamp(targetSectorRain[sector], 0, 100);
      const diff = target - sectorRain[sector];
      const rate = diff > 0
        ? randomBetween(0.045, 0.12) * transitionRateMultiplier
        : randomBetween(0.035, 0.10) * transitionRateMultiplier;

      sectorRain[sector] = moveToward(sectorRain[sector], target, rate);
      if (sectorRain[sector] < 1) sectorRain[sector] = 0;
    }

    let rainAvg = sectorRain.reduce((sum, value) => sum + value, 0) / 3;
    let rainMax = Math.max(...sectorRain);
    if (rainMax > 8) {
      const hasBurst = activeSystems.some((system) => system.type === "burst");
      const sectorFloor = rainMax * (hasBurst ? 0.52 : 0.72);
      const mixToAverage = hasBurst ? 0.18 : 0.30;

      for (let sector = 0; sector < 3; sector++) {
        sectorRain[sector] = Math.max(sectorRain[sector], sectorFloor);
        sectorRain[sector] = sectorRain[sector] * (1 - mixToAverage) + rainAvg * mixToAverage;
      }

      rainAvg = sectorRain.reduce((sum, value) => sum + value, 0) / 3;
      rainMax = Math.max(...sectorRain);
    }
    rainGlobal = rainMax * 0.82 + rainAvg * 0.18;
    if (rainGlobal < 2) rainGlobal = 0;

    for (let sector = 0; sector < 3; sector++) {
      sectorRainAccumulated[sector] += sectorRain[sector];
    }

    for (let sector = 0; sector < 3; sector++) {
      if (sectorRain[sector] > 0) {
        const wetLimit = clamp(sectorRain[sector] * wetLimitMultipliers[sector], 0, 100);
        const wetIncrease = sectorRain[sector] * randomBetween(0.0045, 0.0085);
        sectorWet[sector] = clamp(sectorWet[sector] + wetIncrease, 0, wetLimit);
      } else {
        const dryingNoise = (noise2D(t * 0.0015 + seed, sector * 17) + 1) / 2;
        sectorWet[sector] = clamp(sectorWet[sector] - randomBetween(0.035, 0.12) * (0.75 + dryingNoise * 0.50), 0, 100);
      }
    }

    if (
      t === raceStartSecond &&
      rainGlobal === 0 &&
      sectorRain[0] === 0 &&
      sectorRain[1] === 0 &&
      sectorRain[2] === 0
    ) {
      sectorWet[0] = 0;
      sectorWet[1] = 0;
      sectorWet[2] = 0;
    }

    if (t >= raceStartSecond && t % 30 === 0) {
      const minute = (t - raceStartSecond) / 60;

      data.time.push(minute);
      data.rain_global.push(rainGlobal);
      data.rain_s1.push(sectorRain[sectorOutputOrder[0]]);
      data.rain_s2.push(sectorRain[sectorOutputOrder[1]]);
      data.rain_s3.push(sectorRain[sectorOutputOrder[2]]);
      data.wet_s1.push(sectorWet[sectorOutputOrder[0]]);
      data.wet_s2.push(sectorWet[sectorOutputOrder[1]]);
      data.wet_s3.push(sectorWet[sectorOutputOrder[2]]);
      data.wet_avg.push((sectorWet[0] + sectorWet[1] + sectorWet[2]) / 3);
    }
  }

  if (shouldRainDuringRace && !data.rain_global.some((rain) => rain > 0)) {
    injectFallbackRain(data, probability);
  }

  if (shouldStartWetOrRaining && data.rain_global[0] <= 5 && data.wet_avg[0] <= 5) {
    injectStartingWeather(data, probability);
  }

  extendShortRainRuns(data);
  equalizeWeatherSectors(data);
  preventAbruptWeatherDrops(data);
  equalizeWeatherSectors(data);
  shuffleOutputSectors(data);

  return data;
}

function extendShortRainRuns(data) {
  const minRunPoints = 8;
  const runs = [];
  let start = null;

  for (let index = 0; index <= data.time.length; index++) {
    if (index < data.time.length && data.rain_global[index] > 5 && start === null) {
      start = index;
    }

    if ((index === data.time.length || data.rain_global[index] <= 5) && start !== null) {
      runs.push([start, index - 1]);
      start = null;
    }
  }

  for (const [runStart, runEnd] of runs) {
    const runLength = runEnd - runStart + 1;
    if (runLength >= minRunPoints) continue;

    const peak = Math.max(...data.rain_global.slice(runStart, runEnd + 1));
    const floorRain = Math.max(6, peak * 0.55);
    let needed = minRunPoints - runLength;
    let before = Math.min(runStart, Math.floor(needed / 2));
    let after = Math.min(data.time.length - runEnd - 1, needed - before);

    needed -= before + after;
    if (needed > 0) {
      const extraBefore = Math.min(runStart - before, needed);
      before += extraBefore;
      needed -= extraBefore;
    }
    if (needed > 0) {
      after += Math.min(data.time.length - runEnd - 1 - after, needed);
    }

    for (let index = runStart - before; index <= runEnd + after; index++) {
      const distanceFromRun = index < runStart
        ? runStart - index
        : index > runEnd
          ? index - runEnd
          : 0;
      const fade = distanceFromRun === 0 ? 1 : Math.max(0.55, 1 - distanceFromRun * 0.18);
      const targetRain = floorRain * fade;

      data.rain_s1[index] = Math.max(data.rain_s1[index], targetRain);
      data.rain_s2[index] = Math.max(data.rain_s2[index], targetRain);
      data.rain_s3[index] = Math.max(data.rain_s3[index], targetRain);
      data.wet_s1[index] = Math.max(data.wet_s1[index], targetRain * 0.45);
      data.wet_s2[index] = Math.max(data.wet_s2[index], targetRain * 0.45);
      data.wet_s3[index] = Math.max(data.wet_s3[index], targetRain * 0.45);

      const rainAvg = (data.rain_s1[index] + data.rain_s2[index] + data.rain_s3[index]) / 3;
      const rainMax = Math.max(data.rain_s1[index], data.rain_s2[index], data.rain_s3[index]);
      data.rain_global[index] = rainMax * 0.82 + rainAvg * 0.18;
      data.wet_avg[index] = (data.wet_s1[index] + data.wet_s2[index] + data.wet_s3[index]) / 3;
    }
  }
}

function equalizeWeatherSectors(data) {
  const equalizeTriple = (values, maxSpread) => {
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);

    if (maxValue - minValue <= maxSpread) return values;

    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    const maxDistanceFromAverage = maxSpread / 2;

    return values.map((value) => {
      const limited = Math.max(average - maxDistanceFromAverage, Math.min(average + maxDistanceFromAverage, value));
      return Math.max(0, Math.min(100, limited));
    });
  };

  for (let index = 0; index < data.time.length; index++) {
    const rains = [data.rain_s1[index], data.rain_s2[index], data.rain_s3[index]];
    const wets = [data.wet_s1[index], data.wet_s2[index], data.wet_s3[index]];
    const maxRain = Math.max(...rains);
    const maxWet = Math.max(...wets);

    if (maxRain >= 2) {
      const balancedRain = equalizeTriple(rains, 4);

      data.rain_s1[index] = balancedRain[0];
      data.rain_s2[index] = balancedRain[1];
      data.rain_s3[index] = balancedRain[2];
    }

    if (maxWet >= 2) {
      const balancedWet = equalizeTriple(wets, 4);

      data.wet_s1[index] = balancedWet[0];
      data.wet_s2[index] = balancedWet[1];
      data.wet_s3[index] = balancedWet[2];
    }

    const rainAvg = (data.rain_s1[index] + data.rain_s2[index] + data.rain_s3[index]) / 3;
    const rainMax = Math.max(data.rain_s1[index], data.rain_s2[index], data.rain_s3[index]);
    data.rain_global[index] = rainMax * 0.82 + rainAvg * 0.18;
    data.wet_avg[index] = (data.wet_s1[index] + data.wet_s2[index] + data.wet_s3[index]) / 3;
  }
}

function preventAbruptWeatherDrops(data) {
  const smoothDrop = (values, maxDropPerPoint) => {
    for (let index = 1; index < values.length; index++) {
      const previous = values[index - 1];
      const current = values[index];

      if (previous >= 35 && current < previous - maxDropPerPoint) {
        values[index] = Math.max(0, previous - maxDropPerPoint);
      }
    }
  };

  smoothDrop(data.rain_s1, 22);
  smoothDrop(data.rain_s2, 22);
  smoothDrop(data.rain_s3, 22);
  smoothDrop(data.wet_s1, 16);
  smoothDrop(data.wet_s2, 16);
  smoothDrop(data.wet_s3, 16);

  for (let index = 0; index < data.time.length; index++) {
    const rainAvg = (data.rain_s1[index] + data.rain_s2[index] + data.rain_s3[index]) / 3;
    const rainMax = Math.max(data.rain_s1[index], data.rain_s2[index], data.rain_s3[index]);
    data.rain_global[index] = rainMax * 0.82 + rainAvg * 0.18;
    data.wet_avg[index] = (data.wet_s1[index] + data.wet_s2[index] + data.wet_s3[index]) / 3;
  }

  smoothDrop(data.rain_global, 22);
  smoothDrop(data.wet_avg, 16);
}

function shuffleOutputSectors(data) {
  const order = [0, 1, 2];

  for (let index = order.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [order[index], order[swapIndex]] = [order[swapIndex], order[index]];
  }

  const rainBySector = [data.rain_s1.slice(), data.rain_s2.slice(), data.rain_s3.slice()];
  const wetBySector = [data.wet_s1.slice(), data.wet_s2.slice(), data.wet_s3.slice()];

  data.rain_s1 = rainBySector[order[0]];
  data.rain_s2 = rainBySector[order[1]];
  data.rain_s3 = rainBySector[order[2]];
  data.wet_s1 = wetBySector[order[0]];
  data.wet_s2 = wetBySector[order[1]];
  data.wet_s3 = wetBySector[order[2]];
}

function injectStartingWeather(data, rainProbabilityPercent) {
  if (!data.time.length) return;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const randomBetween = (min, max) => min + Math.random() * (max - min);
  const durationPoints = Math.max(5, Math.min(data.time.length, Math.floor(randomBetween(8, 22))));
  const startsRaining = Math.random() < 0.65;
  const peak = clamp(rainProbabilityPercent * randomBetween(0.35, 0.85), 8, 90);
  const center = randomBetween(0.50, 1.50);
  const footprint = randomBetween(1.20, 1.90);
  const wet = [
    startsRaining ? randomBetween(2, 12) : randomBetween(8, 35),
    startsRaining ? randomBetween(2, 12) : randomBetween(8, 35),
    startsRaining ? randomBetween(2, 12) : randomBetween(8, 35),
  ];

  for (let index = 0; index < durationPoints; index++) {
    const life = index / durationPoints;
    const rainEnvelope = startsRaining
      ? 0.70 + Math.sin(life * Math.PI) * 0.30
      : Math.max(0, 1 - life * 1.4);
    const base = startsRaining ? peak * rainEnvelope : peak * 0.25 * rainEnvelope;
    const localCenter = center + Math.sin(index * 0.35) * 0.12;
    const rain = [0, 0, 0];

    for (let sector = 0; sector < 3; sector++) {
      const coreCoverage = clamp(1 - Math.abs(sector - localCenter) / footprint, 0, 1);
      const coverage = 0.60 + coreCoverage * 0.40;
      rain[sector] = clamp(base * coverage * randomBetween(0.95, 1.05), 0, 100);
      wet[sector] = rain[sector] > 0
        ? clamp(Math.max(wet[sector], rain[sector] * randomBetween(0.45, 0.85)), 0, 100)
        : clamp(wet[sector] - randomBetween(1, 3), 0, 100);
    }

    data.rain_s1[index] = Math.max(data.rain_s1[index], rain[0]);
    data.rain_s2[index] = Math.max(data.rain_s2[index], rain[1]);
    data.rain_s3[index] = Math.max(data.rain_s3[index], rain[2]);

    const rainAvg = (data.rain_s1[index] + data.rain_s2[index] + data.rain_s3[index]) / 3;
    const rainMax = Math.max(data.rain_s1[index], data.rain_s2[index], data.rain_s3[index]);
    data.rain_global[index] = rainMax * 0.82 + rainAvg * 0.18;
    data.wet_s1[index] = Math.max(data.wet_s1[index], wet[0]);
    data.wet_s2[index] = Math.max(data.wet_s2[index], wet[1]);
    data.wet_s3[index] = Math.max(data.wet_s3[index], wet[2]);
    data.wet_avg[index] = (data.wet_s1[index] + data.wet_s2[index] + data.wet_s3[index]) / 3;
  }
}

function injectFallbackRain(data, rainProbabilityPercent) {
  if (!data.time.length) return;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const randomBetween = (min, max) => min + Math.random() * (max - min);
  const durationPoints = Math.max(12, Math.min(data.time.length, Math.floor(randomBetween(18, 34))));
  const startIndex = Math.floor(Math.random() * Math.max(1, data.time.length - durationPoints + 1));
  const center = randomBetween(0, 2);
  const drift = randomBetween(-0.05, 0.05);
  const footprint = randomBetween(0.90, 1.70);
  const peak = clamp(rainProbabilityPercent * randomBetween(0.45, 1.05), 6, 100);
  const wetLimitMultipliers = [
    1.05 + Math.random() * 0.10,
    1.05 + Math.random() * 0.10,
    1.05 + Math.random() * 0.10,
  ];
  const wet = [
    data.wet_s1[startIndex] || 0,
    data.wet_s2[startIndex] || 0,
    data.wet_s3[startIndex] || 0,
  ];

  for (let index = startIndex; index < data.time.length; index++) {
    const eventIndex = index - startIndex;
    const life = eventIndex / durationPoints;
    const rampIn = 0.34;
    const rampOutStart = 0.84;
    const envelope = Math.min(
      1,
      clamp(life / rampIn, 0, 1),
      1 - clamp((life - rampOutStart) / (1 - rampOutStart), 0, 1)
    );
    const localCenter = center + drift * eventIndex + Math.sin(eventIndex * 0.7) * 0.15;
    const base = peak * Math.pow(Math.max(0, envelope), randomBetween(0.75, 1.15)) * (0.92 + Math.sin(eventIndex * 0.45) * 0.08);
    const rain = [0, 0, 0];

    for (let sector = 0; sector < 3; sector++) {
      const coreCoverage = clamp(1 - Math.abs(sector - localCenter) / footprint, 0, 1);
      const coverage = base > 3 ? 0.16 + coreCoverage * 0.84 : coreCoverage;
      rain[sector] = clamp(base * coverage * randomBetween(0.92, 1.08), 0, 100);
    }

    const rainMaxBeforeWet = Math.max(...rain);
    if (rainMaxBeforeWet > 8) {
      for (let sector = 0; sector < 3; sector++) {
        rain[sector] = Math.max(rain[sector], rainMaxBeforeWet * 0.55);
      }
    }

    for (let sector = 0; sector < 3; sector++) {
      wet[sector] = rain[sector] > 0
        ? clamp(wet[sector] + rain[sector] * randomBetween(0.12, 0.22), 0, clamp(rain[sector] * wetLimitMultipliers[sector], 0, 100))
        : clamp(wet[sector] - randomBetween(2, 5), 0, 100);
    }

    data.rain_s1[index] = rain[0];
    data.rain_s2[index] = rain[1];
    data.rain_s3[index] = rain[2];
    const rainAvg = (rain[0] + rain[1] + rain[2]) / 3;
    const rainMax = Math.max(...rain);
    data.rain_global[index] = rainMax * 0.82 + rainAvg * 0.18;
    data.wet_s1[index] = wet[0];
    data.wet_s2[index] = wet[1];
    data.wet_s3[index] = wet[2];
    data.wet_avg[index] = (wet[0] + wet[1] + wet[2]) / 3;
  }
}

function tstr(t) {
  const s = Math.floor(t * 60);
  const m = String(Math.floor(s / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${m}:${sec}`;
}

function future(data, idx, offset) {
  const j = idx + offset;
  if (j < data.time.length) return data.rain_global[j];
  return null;
}


function generateReport(data) {
  const report = [];
  const RAIN_THRESHOLD = 5; 

  let raining = data.rain_global[0] > RAIN_THRESHOLD;
  let lastTrackState = data.wet_avg[0] >= 100 ? "wet" : "dry";
  
  let lastPredictiveTime = -10; 
  let lastPredictiveType = null; 
  let lastSectorAlert = -10;

  if (raining) report.push({ time: tstr(data.time[0]), id: "RAIN_ALREADY_STARTED", meta: { rain: Math.round(data.rain_global[0]) } });
  else report.push({ time: tstr(data.time[0]), id: "CLEAR_START" });

  for (let i = 1; i < data.time.length; i++) {
    const t = data.time[i];
    const rain = data.rain_global[i];
    const wet = data.wet_avg[i];
    const time = tstr(t);

    const rainIn30s = future(data, i, 1);
    const rainIn1Min = future(data, i, 2);
    const rainIn3Min = future(data, i, 6);

    let eventHappened = false;

    if (rain > RAIN_THRESHOLD && !raining) {
      report.push({ time, id: "RAIN_STARTED", meta: { rain: Math.round(rain) } });
      raining = true;
      eventHappened = true;
    } else if (rain <= RAIN_THRESHOLD && raining) {
      report.push({ time, id: "RAIN_STOPPED" });
      raining = false;
      eventHappened = true;
    }

    if (wet >= 100 && lastTrackState !== "wet") {
      report.push({ time, id: "TRACK_WET", meta: { wet: 100 } });
      lastTrackState = "wet";
      eventHappened = true;
    } else if (wet < 10 && lastTrackState !== "dry") {
      report.push({ time, id: "TRACK_DRY" });
      lastTrackState = "dry";
      eventHappened = true;
    }

    if (eventHappened) {
      lastPredictiveTime = t;
      lastPredictiveType = "CRITICAL"; 
      continue;
    }

    let currentPrediction = null;

    if (!raining) {
      if (rainIn30s <= RAIN_THRESHOLD && rainIn1Min > RAIN_THRESHOLD) {
        currentPrediction = "RAIN_IN_1_MIN";
      } else if (rainIn3Min > 15 && rainIn1Min <= RAIN_THRESHOLD) {
        currentPrediction = "CLOUDS_FORMING";
      }
    } else {
      if (rainIn30s > RAIN_THRESHOLD && rainIn1Min <= RAIN_THRESHOLD) {
        currentPrediction = "RAIN_STOPPING_1_MIN";
      } else {
        const delta = rain - rainIn3Min;
        if (Math.abs(delta) > 25) {
          currentPrediction = delta > 0 ? "RAIN_WEAKENING" : "RAIN_INTENSIFYING";
        }
      }
    }

    if (currentPrediction) {
      const timeSinceLast = t - lastPredictiveTime;
      
      const isUrgentUpgrade = 
        (currentPrediction.includes("1_MIN") && lastPredictiveType === "CLOUDS_FORMING") ||
        (currentPrediction === "RAIN_INTENSIFYING" && lastPredictiveType === "RAIN_WEAKENING");

      if (timeSinceLast >= 1.5 || isUrgentUpgrade) {
        if (currentPrediction !== lastPredictiveType || timeSinceLast >= 2.0) {
          report.push({ time, id: currentPrediction });
          lastPredictiveTime = t;
          lastPredictiveType = currentPrediction;
        }
      }
    }

    const sDist = Math.max(data.wet_s1[i], data.wet_s2[i], data.wet_s3[i]) - Math.min(data.wet_s1[i], data.wet_s2[i], data.wet_s3[i]);
    if (sDist > 30 && (t - lastSectorAlert > 3.0)) {
      report.push({ time, id: "SECTOR_DIFFERENCE" });
      lastSectorAlert = t;
    }
  }

  return report;
}
const args = process.argv.slice(2);
const rainPercent = Number(args[0] || 50);
const raceMinutes = Number(args[1] || 20);
const weatherId = args[2] || `weather_${Date.now()}`;

const result = simulateWeather(rainPercent, raceMinutes);

fs.mkdirSync("./weather_data", { recursive: true });
fs.writeFileSync(
  `./weather_data/weather_${weatherId}.json`,
  JSON.stringify(result, null, 2)
);

const report = generateReport(result);

fs.writeFileSync(
  `./weather_data/weather_report_${weatherId}.json`,
  JSON.stringify(report, null, 2)
);

const debug = report.map(r => {
  return `${r.time} - ${r.id} ${r.meta ? JSON.stringify(r.meta) : ""}`;
});

fs.writeFileSync(
  `./weather_data/weather_report_${weatherId}.txt`,
  debug.join("\n")
);

console.log(debug.join("\n"));


const chartCanvas = new ChartJSNodeCanvas({ width: 1200, height: 600 });

async function generateCharts() {
  const rainBuffer = await chartCanvas.renderToBuffer({
    type: "line",
    data: {
      labels: result.time,
      datasets: [
        { label: "Global", data: result.rain_global },
        { label: "S1", data: result.rain_s1 },
        { label: "S2", data: result.rain_s2 },
        { label: "S3", data: result.rain_s3 }
      ]
    }
  });

  fs.mkdirSync("./rain_charts", { recursive: true });
  fs.writeFileSync(`./rain_charts/rain_${weatherId}.png`, rainBuffer);

  const wetBuffer = await chartCanvas.renderToBuffer({
    type: "line",
    data: {
      labels: result.time,
      datasets: [
        { label: "Média", data: result.wet_avg },
        { label: "S1", data: result.wet_s1 },
        { label: "S2", data: result.wet_s2 },
        { label: "S3", data: result.wet_s3 }
      ]
    }
  });

  fs.mkdirSync("./wet_charts", { recursive: true });
  fs.writeFileSync(`./wet_charts/wet_${weatherId}.png`, wetBuffer);

  console.log(`\n✅ Everything generated! ID: ${weatherId}`);
}

generateCharts();
