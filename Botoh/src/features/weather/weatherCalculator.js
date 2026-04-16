// =========================
// INSTALAÇÃO
// =========================
// npm init -y
// npm install simplex-noise chartjs-node-canvas canvas

const fs = require("fs");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const { createNoise2D } = require("simplex-noise");

// =========================
// SIMULAÇÃO
// =========================
function simulateWeather(rainProbabilityPercent, raceMinutes) {
  const warmupMinutes = raceMinutes > 0 ? Math.floor(raceMinutes / 2) : 10;
  const totalSimMinutes = raceMinutes + warmupMinutes;
  const steps = totalSimMinutes * 60;

  const timeScale = 0.002;
  const noise2D = createNoise2D();
  const seed = Math.random() * 1000;

  let rainGlobal = 0;
  let rainS1 = 0;
  let rainS2 = 0;
  let rainS3 = 0;

  let wetS1 = 0;
  let wetS2 = 0;
  let wetS3 = 0;

  // 🔥 NOVO: estabilização
  let rainIsStabilized = false;
  let stabilizedIntensity = 0;

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

  for (let t = 0; t < steps; t++) {
    const nt = t * timeScale;

    const chanceNoise = (noise2D(nt + seed, 0) + 1) / 2;
    const intensityNoise = (noise2D(nt + seed + 500, 0) + 1) / 2;

    const rainThreshold = 1 - (rainProbabilityPercent / 100);

    // 🔥 ESTABILIZAÇÃO
    if (rainIsStabilized) {
      rainGlobal = stabilizedIntensity;
    } else if (chanceNoise > rainThreshold) {
      let rainIntensity = intensityNoise * rainProbabilityPercent * 1.5;
      rainGlobal = Math.max(0, Math.min(100, rainIntensity));

      if (rainGlobal < 5) rainGlobal = 0;

      if (rainGlobal > 20 && Math.random() < 0.0005) {
        rainIsStabilized = true;
        stabilizedIntensity = rainGlobal;
      }
    } else {
      rainGlobal = 0;
    }

    const getSectorBase = (offset) =>
      ((noise2D(nt + seed + offset, 0) + 1) / 2) * rainProbabilityPercent;

    if (rainGlobal === 0) {
      rainS1 = Math.max(0, rainS1 * 0.8 - 0.8);
      rainS2 = Math.max(0, rainS2 * 0.8 - 0.8);
      rainS3 = Math.max(0, rainS3 * 0.8 - 0.8);
    } else {
      rainS1 = rainGlobal + (getSectorBase(10) - rainProbabilityPercent / 2) * 0.8;
      rainS2 = rainGlobal + (getSectorBase(20) - rainProbabilityPercent / 2) * 0.8;
      rainS3 = rainGlobal + (getSectorBase(30) - rainProbabilityPercent / 2) * 0.8;
    }

    rainS1 = Math.max(0, Math.min(100, rainS1));
    rainS2 = Math.max(0, Math.min(100, rainS2));
    rainS3 = Math.max(0, Math.min(100, rainS3));

    if (rainS1 < 5) rainS1 = 0;
    if (rainS2 < 5) rainS2 = 0;
    if (rainS3 < 5) rainS3 = 0;

    const updateWet = (wet, rain) => {
      if (rain > 0) wet += rain * 0.025;
      else wet -= 0.5;
      return Math.max(0, Math.min(100, wet));
    };

    wetS1 = updateWet(wetS1, rainS1);
    wetS2 = updateWet(wetS2, rainS2);
    wetS3 = updateWet(wetS3, rainS3);

    if (t >= warmupMinutes * 60 && t % 30 === 0) {
      const minute = (t - warmupMinutes * 60) / 60;

      data.time.push(minute);
      data.rain_global.push(rainGlobal);
      data.rain_s1.push(rainS1);
      data.rain_s2.push(rainS2);
      data.rain_s3.push(rainS3);
      data.wet_s1.push(wetS1);
      data.wet_s2.push(wetS2);
      data.wet_s3.push(wetS3);
      data.wet_avg.push((wetS1 + wetS2 + wetS3) / 3);
    }
  }

  return data;
}

// =========================
// UTIL
// =========================
function tstr(t) {
  const s = Math.floor(t * 60);
  const m = String(Math.floor(s / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${m}:${sec}`;
}

function future(data, idx, offset) {
  const j = idx + offset;
  if (j < data.time.length) return data.rain_global[j];
  return null; // 🔥 FIX
}

// =========================
// RELATÓRIO PRO
// =========================
function generateReport(data) {
  const report = [];
  report.push("📻 METEOROLOGISTA PRO:\n");

  let raining = false;
  let lastEventTime = -10;
  let lastTrackState = null;
  let lastSectorAlert = -10;

  for (let i = 0; i < data.time.length; i++) {
    const t = data.time[i];
    const rain = data.rain_global[i];
    const wet = data.wet_avg[i];

    const time = tstr(t);

    const rain1 = future(data, i, 2);
    const rain2 = future(data, i, 4);
    const rain4 = future(data, i, 8);

    if (i === 0) {
      if (rain > 10) {
        report.push(`${time} - 🎙️ Já chove no circuito (${rain.toFixed(0)}%).`);
        raining = true;
      } else if (wet > 20) {
        report.push(`${time} - 🎙️ Pista começa molhada (${wet.toFixed(0)}%).`);
      } else {
        report.push(`${time} - 🎙️ Céu limpo e pista seca.`);
      }
      continue;
    }

    if (t - lastEventTime < 1) continue;

    // INÍCIO CHUVA
    if (rain > 10 && !raining) {
      report.push(`${time} - 🌧️ Começou a chover (${rain.toFixed(0)}%).`);
      raining = true;
      lastEventTime = t;
      continue;
    }

    // FIM
    if (rain === 0 && raining) {
      report.push(`${time} - 🌤️ A chuva parou completamente.`);
      raining = false;
      lastEventTime = t;
      continue;
    }

    // PREVISÕES
    if (!raining) {
      if (rain1 !== null && rain1 > 10) {
        report.push(`${time} - 🌧️ Chuva prevista em cerca de 1 minuto.`);
        lastEventTime = t;
        continue;
      }
      if (rain4 !== null && rain4 > 10) {
        report.push(`${time} - ☁️ Nuvens se formando.`);
        lastEventTime = t;
        continue;
      }
    }

    if (raining) {
      if (rain1 !== null && rain1 === 0) {
        report.push(`${time} - 🌤️ Chuva deve parar em cerca de 1 minuto.`);
        lastEventTime = t;
        continue;
      }
      if (rain4 !== null && rain4 === 0) {
        report.push(`${time} - 🌥️ Chuva enfraquecendo.`);
        lastEventTime = t;
        continue;
      }
    }

    // PISTA
    if (wet > 40 && lastTrackState !== "wet") {
      report.push(`${time} - 🛣️ Pista bastante molhada.`);
      lastTrackState = "wet";
      lastEventTime = t;
      continue;
    }

    if (wet < 10 && lastTrackState !== "dry") {
      report.push(`${time} - ☀️ Pista seca.`);
      lastTrackState = "dry";
      lastEventTime = t;
      continue;
    }

    // SETORES
    const s1 = data.wet_s1[i];
    const s2 = data.wet_s2[i];
    const s3 = data.wet_s3[i];

    if (Math.max(s1, s2, s3) - Math.min(s1, s2, s3) > 25) {
      if (t - lastSectorAlert > 2) {
        report.push(`${time} - ⚠️ Diferença entre setores.`);
        lastSectorAlert = t;
      }
    }
  }

  return report;
}

// =========================
// EXECUÇÃO
// =========================
const args = process.argv.slice(2);
const rainPercent = Number(args[0] || 50);
const raceMinutes = Number(args[1] || 20);
const weatherId = args[2] || `weather_${Date.now()}`;

const result = simulateWeather(rainPercent, raceMinutes);

// salvar JSON
fs.mkdirSync("./weather_data", { recursive: true });
fs.writeFileSync(
  `./weather_data/weather_${weatherId}.json`,
  JSON.stringify(result, null, 2)
);

// gerar relatório
const report = generateReport(result);
fs.writeFileSync(
  `./weather_data/weather_report_${weatherId}.txt`,
  report.join("\n")
);

console.log(report.join("\n"));

// =========================
// GRÁFICOS
// =========================
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

  console.log(`\n✅ Tudo gerado! ID: ${weatherId}`);
}

generateCharts();