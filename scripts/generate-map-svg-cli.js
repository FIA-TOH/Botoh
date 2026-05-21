#!/usr/bin/env node

/**
 * Script CLI para gerar SVG de mapa Haxball específico
 * Uso: node generate-map-svg-cli.js [mapa] [opções]
 */

const fs = require('fs');
const path = require('path');

/**
 * Importa a função de geração de SVG do script avançado
 */
const { generateMapSVG } = require('./generate-map-svg-advanced.js');

/**
 * Exibe ajuda
 */
function showHelp() {
  console.log(`
🗺️ Gerador de SVG para Mapas Haxball

Uso:
  node generate-map-svg-cli.js <mapa> [opções]

Exemplos:
  node generate-map-svg-cli.js imola
  node generate-map-svg-cli.js imola --transparent
  node generate-map-svg-cli.js monza --transparent --stroke-width 3
  node generate-map-svg-cli.js all --transparent

Mapas disponíveis:
${getAvailableMaps().map(map => `  - ${map}`).join('\n')}

Opções:
  --transparent     Fundo transparente (padrão: #0a0a0a)
  --stroke-width N  Largura das linhas (padrão: 2)
  --show-grid      Mostrar grade de fundo
  --show-center    Mostrar linhas centrais
  --show-bounds    Mostrar bounds do mapa
  --show-ids       Mostrar IDs dos segmentos
  --no-grid        Ocultar grade
  --no-center      Ocultar linhas centrais
  --no-bounds      Ocultar bounds
  --padding N      Padding do mapa (padrão: 0.1)

Saída:
  SVG salvo em: apps/frontend/public/maps/[mapa].svg
`);
}

/**
 * Lista mapas disponíveis
 */
function getAvailableMaps() {
  const mapsDir = path.join(__dirname, '../Botoh/src/circuits');
  
  if (!fs.existsSync(mapsDir)) {
    return [];
  }
  
  const circuits = fs.readdirSync(mapsDir, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name);
  
  const availableMaps = [];
  
  for (const circuit of circuits) {
    const circuitDir = path.join(mapsDir, circuit);
    const hbsFiles = fs.readdirSync(circuitDir).filter(file => file.endsWith('.hbs'));
    
    for (const hbsFile of hbsFiles) {
      const mapName = hbsFile.replace('.hbs', '');
      availableMaps.push(mapName);
    }
  }
  
  return [...new Set(availableMaps)].sort(); // Remove duplicados e ordena
}

/**
 * Parse dos argumentos de linha de comando
 */
function parseArguments() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }
  
  const targetMap = args[0];
  const options = {
    transparent: false,
    strokeWidth: 2,
    showGrid: false,
    showCenterLines: false,
    showBounds: false,
    showSegmentIds: false,
    padding: 0.1
  };
  
  // Parse opções
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--transparent':
        options.transparent = true;
        break;
      case '--stroke-width':
        options.strokeWidth = parseFloat(args[++i]) || 2;
        break;
      case '--show-grid':
        options.showGrid = true;
        break;
      case '--no-grid':
        options.showGrid = false;
        break;
      case '--show-center':
        options.showCenterLines = true;
        break;
      case '--no-center':
        options.showCenterLines = false;
        break;
      case '--show-bounds':
        options.showBounds = true;
        break;
      case '--no-bounds':
        options.showBounds = false;
        break;
      case '--show-ids':
        options.showSegmentIds = true;
        break;
      case '--padding':
        options.padding = parseFloat(args[++i]) || 0.1;
        break;
      default:
        if (arg.startsWith('--')) {
          console.warn(`⚠️ Opção desconhecida: ${arg}`);
        }
    }
  }
  
  return { targetMap, options };
}

/**
 * Encontra o arquivo do mapa
 */
function findMapFile(mapName) {
  const mapsDir = path.join(__dirname, '../Botoh/src/circuits');
  
  if (!fs.existsSync(mapsDir)) {
    throw new Error('Diretório de mapas não encontrado');
  }
  
  // Procurar em todos os circuitos
  const circuits = fs.readdirSync(mapsDir, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name);
  
  for (const circuit of circuits) {
    const circuitDir = path.join(mapsDir, circuit);
    const hbsFile = path.join(circuitDir, `${mapName}.hbs`);
    
    if (fs.existsSync(hbsFile)) {
      return hbsFile;
    }
  }
  
  throw new Error(`Mapa "${mapName}" não encontrado`);
}

/**
 * Gera SVG para um mapa específico
 */
function generateSVGForMap(mapName, options) {
  try {
    console.log(`🔄 Procurando mapa: ${mapName}`);
    
    // Encontrar arquivo do mapa
    const mapFilePath = findMapFile(mapName);
    console.log(`📁 Arquivo encontrado: ${mapFilePath}`);
    
    // Carregar dados do mapa
    const content = fs.readFileSync(mapFilePath, 'utf8');
    let cleanContent = content;
    cleanContent = cleanContent.replace(/\/\*[\s\S]*?\*\//g, '');
    cleanContent = cleanContent.replace(/\/\/.*$/gm, '');
    cleanContent = cleanContent.replace(/,(\s*[}\]])/g, '$1');
    
    const mapData = JSON.parse(cleanContent);
    console.log(`🗺️ Mapa: ${mapData.name}`);
    
    // Configurar opções do SVG
    const svgOptions = {
      backgroundColor: options.transparent ? 'transparent' : '#0a0a0a',
      gridColor: 'rgba(255,255,255,0.05)',
      centerLineColor: 'rgba(255,0,0,0.2)',
      showGrid: options.showGrid,
      showCenterLines: options.showCenterLines,
      showBounds: options.showBounds,
      showSegmentIds: options.showSegmentIds,
      strokeWidth: options.strokeWidth,
      padding: options.padding
    };
    
    // Gerar SVG
    const svgContent = generateMapSVG(mapData, svgOptions);
    
    // Garantir diretório de saída
    const outputDir = path.join(__dirname, '../apps/frontend/public/maps');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`📁 Criado diretório: ${outputDir}`);
    }
    
    // Salvar SVG
    const outputPath = path.join(outputDir, `${mapName}.svg`);
    fs.writeFileSync(outputPath, svgContent, 'utf8');
    
    console.log(`✅ SVG gerado: ${outputPath}`);
    console.log(`🎨 Fundo: ${options.transparent ? 'transparente' : '#0a0a0a'}`);
    console.log(`🖊 Stroke: ${options.strokeWidth}px`);
    
    return {
      success: true,
      mapName: mapData.name,
      outputFile: `${mapName}.svg`,
      outputPath
    };
    
  } catch (error) {
    console.error(`❌ Erro ao gerar SVG para "${mapName}": ${error.message}`);
    return {
      success: false,
      mapName,
      error: error.message
    };
  }
}

/**
 * Gera SVGs para todos os mapas
 */
function generateAllMaps(options) {
  console.log('🔄 Gerando SVGs para todos os mapas...');
  
  const availableMaps = getAvailableMaps();
  const results = [];
  
  for (const mapName of availableMaps) {
    const result = generateSVGForMap(mapName, options);
    results.push(result);
    
    if (!result.success) {
      console.log(`⚠️ Falha ao gerar ${mapName}: ${result.error}`);
    }
  }
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log('');
  console.log('📊 Estatísticas:');
  console.log(`   ✅ Sucesso: ${successful}`);
  console.log(`   ❌ Falhas: ${failed}`);
  console.log(`   📁 Total: ${results.length}`);
  
  return results;
}

/**
 * Função principal
 */
function main() {
  try {
    const { targetMap, options } = parseArguments();
    
    console.log('🗺️ Gerador de SVG para Mapas Haxball');
    console.log(`🎨 Fundo: ${options.transparent ? 'transparente' : '#0a0a0a'}`);
    console.log(`🖊 Stroke: ${options.strokeWidth}px`);
    console.log('');
    
    if (targetMap === 'all') {
      generateAllMaps(options);
    } else {
      const result = generateSVGForMap(targetMap, options);
      
      if (result.success) {
        console.log('');
        console.log('🎉 SVG gerado com sucesso!');
        console.log(`📂 Caminho completo: ${result.outputPath}`);
        console.log(`🌐 URL no frontend: /maps/${result.outputFile}`);
      } else {
        console.log('');
        console.log('❌ Falha ao gerar SVG');
        process.exit(1);
      }
    }
    
  } catch (error) {
    console.error(`❌ Erro: ${error.message}`);
    process.exit(1);
  }
}

// Executar script
if (require.main === module) {
  main();
}

module.exports = {
  generateSVGForMap,
  getAvailableMaps,
  generateAllMaps
};
