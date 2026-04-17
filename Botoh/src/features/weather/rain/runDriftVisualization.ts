import { generateDriftVisualization, generateSimpleTable } from './driftVisualization';

/**
 * Run this file to see drift visualization
 * Command: npx ts-node runDriftVisualization.ts
 */
console.log('🏁 GENERATING DRIFT SYSTEM VISUALIZATION 🏁\n');

// Generate complete visualization with graphic bars
generateDriftVisualization();

// Generate simplified table
generateSimpleTable();

console.log('\n✅ Visualization completed!');
console.log('💡 Tips:');
console.log('   - 100% wet track always adds +50 base drift');
console.log('   - Dry tires: reach +50 drift fast (at 30% rain)');
console.log('   - Inter tires: reach +50 drift medium (at 60% rain)');
console.log('   - Wet tires: reach +50 drift slow (at 90% rain)');
console.log('   - Drift 100 = max direction changer effect');
