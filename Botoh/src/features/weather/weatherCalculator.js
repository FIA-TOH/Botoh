// =========================
// INSTALAÇÃO
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

    if (chanceNoise > rainThreshold) {
      let rainIntensity = intensityNoise * rainProbabilityPercent * 1.5;
      rainGlobal = Math.max(0, Math.min(100, rainIntensity));
      if (rainGlobal < 5) rainGlobal = 0;
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
// CLI
// =========================
const args = process.argv.slice(2);
const rainPercent = Number(args[0] || 50);
const raceMinutes = Number(args[1] || 20);
const weatherId = args[2] || `weather_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const result = simulateWeather(rainPercent, raceMinutes);


fs.mkdirSync("./weather_data", { recursive: true }); fs.writeFileSync(`./weather_data/weather_data_${weatherId}.json`, JSON.stringify(result, null, 2));
console.log(`./weather_data/weather_data_\${weatherId}.json gerado!`);


const width = 1200;
const height = 600;
const chartCanvas = new ChartJSNodeCanvas({ width, height });

async function generateCharts() {
  const rainConfig = {
    type: "line",
    data: {
      labels: result.time,
      datasets: [
        { label: "Global", data: result.rain_global },
        { label: "Setor 1", data: result.rain_s1 },
        { label: "Setor 2", data: result.rain_s2 },
        { label: "Setor 3", data: result.rain_s3 }
      ]
    }
  };

  const rainBuffer = await chartCanvas.renderToBuffer(rainConfig);
  fs.mkdirSync("./rain_charts", { recursive: true }); fs.writeFileSync(`./rain_charts/rain_chart_${weatherId}.png`, rainBuffer);

  const wetConfig = {
    type: "line",
    data: {
      labels: result.time,
      datasets: [
        { label: "Média", data: result.wet_avg },
        { label: "Setor 1", data: result.wet_s1 },
        { label: "Setor 2", data: result.wet_s2 },
        { label: "Setor 3", data: result.wet_s3 }
      ]
    }
  };

  const wetBuffer = await chartCanvas.renderToBuffer(wetConfig);
  fs.mkdirSync("./wet_charts", { recursive: true }); fs.writeFileSync(`./wet_charts/wet_chart_${weatherId}.png`, wetBuffer);

  console.log(`Gráficos gerados! (ID: ${weatherId})`);
}

generateCharts();



