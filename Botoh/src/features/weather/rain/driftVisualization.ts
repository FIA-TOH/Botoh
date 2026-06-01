import { calculateTotalDrift } from './driftCalculator';
import { TireType } from '../driftConfig';
import { currentWeather } from '../currentWeather';


export function generateDriftVisualization() {
  console.log('=== DRIFT VISUALIZATION ===');
  console.log('Base: drift now depends only on wet track, not active rain\n');
  
  currentWeather.rainGlobal = 0;
  currentWeather.rainS1 = 0;
  currentWeather.rainS2 = 0;
  currentWeather.rainS3 = 0;
  
  const wetLevels = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];
  const tireTypes = [
    { type: TireType.DRY, name: 'DRY TIRE', color: '🔴' },
    { type: TireType.INTER, name: 'INTER TIRE', color: '🟡' },
    { type: TireType.WET, name: 'WET TIRE', color: '🔵' }
  ];
  
  console.log('WET %  | DRY TIRE | INTER TIRE | WET TIRE');
  console.log('--------|----------|------------|----------');
  
  wetLevels.forEach(wet => {
    currentWeather.wetAvg = wet;
    currentWeather.wetS1 = wet;
    currentWeather.wetS2 = wet;
    currentWeather.wetS3 = wet;
    
    const dryDrift = calculateTotalDrift(TireType.DRY, 1);
    const interDrift = calculateTotalDrift(TireType.INTER, 1);
    const wetDrift = calculateTotalDrift(TireType.WET, 1);
    
    const dryBar = createBar(dryDrift, 30, '█');
    const interBar = createBar(interDrift, 30, '▓');
    const wetBar = createBar(wetDrift, 30, '░');
    
    console.log(
      `${wet.toString().padStart(7)} | ${dryDrift.toFixed(1).padStart(9)} ${dryBar} | ${interDrift.toFixed(1).padStart(10)} ${interBar} | ${wetDrift.toFixed(1).padStart(8)} ${wetBar}`
    );
  });
  
  console.log('\n=== DETAILED ANALYSIS ===\n');
  
  tireTypes.forEach(tire => {
    console.log(`${tire.color} ${tire.name}:`);
    console.log(`   Wet track threshold: ${getThreshold(tire.type)}%`);
    console.log(`   Min drift (0% wet): ${calculateTotalDrift(tire.type, 1).toFixed(1)}`);
    console.log(`   Max drift (100% wet): ${calculateTotalDrift(tire.type, 1).toFixed(1)}`);
    console.log(`   +50 drift point: ${find50DriftPoint(tire.type)}% wet\n`);
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
    case TireType.DRY: return 90;
    case TireType.INTER: return 75;
    case TireType.WET: return 90;
    default: return 0;
  }
}

function find50DriftPoint(tireType: TireType): number {
  for (let wet = 0; wet <= 100; wet += 1) {
    currentWeather.wetAvg = wet;
    currentWeather.wetS1 = wet;
    currentWeather.wetS2 = wet;
    currentWeather.wetS3 = wet;
    
    const drift = calculateTotalDrift(tireType, 1);
    if (drift >= 100) {
      return wet;
    }
  }
  return 100;
}

export function generateSimpleTable() {
  console.log('\n=== Table ===');
  console.log('Wet  | Dry | Inter | Wet');
  console.log('------|------|-------|-----');
  
  currentWeather.rainGlobal = 0;
  currentWeather.rainS1 = 0;
  currentWeather.rainS2 = 0;
  currentWeather.rainS3 = 0;
  
  const wetLevels = [0, 15, 30, 45, 60, 75, 90, 100];
  
  wetLevels.forEach(wetLevel => {
    currentWeather.wetAvg = wetLevel;
    currentWeather.wetS1 = wetLevel;
    currentWeather.wetS2 = wetLevel;
    currentWeather.wetS3 = wetLevel;
    
    const dry = calculateTotalDrift(TireType.DRY, 1);
    const inter = calculateTotalDrift(TireType.INTER, 1);
    const wet = calculateTotalDrift(TireType.WET, 1);
    
    console.log(`${wetLevel.toString().padStart(5)} | ${dry.toFixed(0).padStart(4)} | ${inter.toFixed(0).padStart(5)} | ${wet.toFixed(0).padStart(3)}`);
  });
}

export { TireType };
