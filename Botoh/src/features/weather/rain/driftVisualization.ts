import { calculateTotalDrift, calculateWetnessDrift, calculateRainDrift } from './driftCalculator';
import { TireType } from '../driftConfig';
import { currentWeather } from '../currentWeather';


export function generateDriftVisualization() {
  console.log('=== DRIFT VISUALIZATION ===');
  console.log('Base: 100% wet track (+50 wetness drift)\n');
  
  currentWeather.wetAvg = 100;
  currentWeather.wetS1 = 100;
  currentWeather.wetS2 = 100;
  currentWeather.wetS3 = 100;
  
  const rainLevels = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];
  const tireTypes = [
    { type: TireType.DRY, name: 'DRY TIRE', color: '🔴' },
    { type: TireType.INTER, name: 'INTER TIRE', color: '🟡' },
    { type: TireType.WET, name: 'WET TIRE', color: '🔵' }
  ];
  
  console.log('RAIN % | DRY TIRE | INTER TIRE | WET TIRE');
  console.log('--------|----------|------------|----------');
  
  rainLevels.forEach(rain => {
    currentWeather.rainGlobal = rain;
    currentWeather.rainS1 = rain;
    currentWeather.rainS2 = rain;
    currentWeather.rainS3 = rain;
    
    const dryDrift = calculateTotalDrift(TireType.DRY, 1);
    const interDrift = calculateTotalDrift(TireType.INTER, 1);
    const wetDrift = calculateTotalDrift(TireType.WET, 1);
    
    const dryBar = createBar(dryDrift, 30, '█');
    const interBar = createBar(interDrift, 30, '▓');
    const wetBar = createBar(wetDrift, 30, '░');
    
    console.log(
      `${rain.toString().padStart(7)} | ${dryDrift.toFixed(1).padStart(9)} ${dryBar} | ${interDrift.toFixed(1).padStart(10)} ${interBar} | ${wetDrift.toFixed(1).padStart(8)} ${wetBar}`
    );
  });
  
  console.log('\n=== DETAILED ANALYSIS ===\n');
  
  tireTypes.forEach(tire => {
    console.log(`${tire.color} ${tire.name}:`);
    console.log(`   Rain threshold: ${getThreshold(tire.type)}%`);
    console.log(`   Min drift (0% rain): ${calculateTotalDrift(tire.type, 1).toFixed(1)}`);
    console.log(`   Max drift (100% rain): ${calculateTotalDrift(tire.type, 1).toFixed(1)}`);
    console.log(`   +50 drift point: ${find50DriftPoint(tire.type)}% rain\n`);
  });
  
  console.log('=== LEGEND ===');
  console.log('█ = Dry Tire  |  ▓ = Inter Tire  |  ░ = Wet Tire');
  console.log('Drift 0 = no effect | Drift 100 = max effect');
}

function createBar(value: number, maxSize: number, char: string): string {
  const barSize = Math.round((value / 100) * maxSize);
  return '[' + char.repeat(barSize) + ' '.repeat(maxSize - barSize) + ']';
}

function getThreshold(tireType: TireType): number {
  switch (tireType) {
    case TireType.DRY: return 30;
    case TireType.INTER: return 60;
    case TireType.WET: return 90;
    default: return 0;
  }
}

function find50DriftPoint(tireType: TireType): number {
  for (let rain = 0; rain <= 100; rain += 1) {
    currentWeather.rainGlobal = rain;
    currentWeather.rainS1 = rain;
    currentWeather.rainS2 = rain;
    currentWeather.rainS3 = rain;
    
    const drift = calculateTotalDrift(tireType, 1);
    if (drift >= 100) {
      return rain;
    }
  }
  return 100;
}

export function generateSimpleTable() {
  console.log('\n=== Table ===');
  console.log('Rain | Dry | Inter | Wet');
  console.log('------|------|-------|-----');
  
  currentWeather.wetAvg = 100;
  currentWeather.wetS1 = 100;
  currentWeather.wetS2 = 100;
  currentWeather.wetS3 = 100;
  
  const rainLevels = [0, 15, 30, 45, 60, 75, 90, 100];
  
  rainLevels.forEach(rain => {
    currentWeather.rainGlobal = rain;
    currentWeather.rainS1 = rain;
    currentWeather.rainS2 = rain;
    currentWeather.rainS3 = rain;
    
    const dry = calculateTotalDrift(TireType.DRY, 1);
    const inter = calculateTotalDrift(TireType.INTER, 1);
    const wet = calculateTotalDrift(TireType.WET, 1);
    
    console.log(`${rain.toString().padStart(5)} | ${dry.toFixed(0).padStart(4)} | ${inter.toFixed(0).padStart(5)} | ${wet.toFixed(0).padStart(3)}`);
  });
}

export { TireType };
