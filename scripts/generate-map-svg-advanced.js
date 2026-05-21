/**
 * Gerador Avançado de SVG para Mapas Haxball
 * Com sistema de coordenadas preciso e metadata para posicionamento
 */

/**
 * Calcula bounds do mapa
 */
function calculateMapBounds(vertexes) {
  if (!vertexes || vertexes.length === 0) {
    return { minX: -500, maxX: 500, minY: -500, maxY: 500 };
  }

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  vertexes.forEach(vertex => {
    minX = Math.min(minX, vertex.x);
    maxX = Math.max(maxX, vertex.x);
    minY = Math.min(minY, vertex.y);
    maxY = Math.max(maxY, vertex.y);
  });

  return { minX, maxX, minY, maxY };
}

/**
 * Gera elemento de segmento SVG
 */
function generateSegmentElement(segment, v0, v1, options) {
  const { strokeColor, strokeWidth, showSegmentIds } = options;
  
  // Verificar se é uma curva
  if (segment.curve !== undefined && segment.curve !== 0) {
    // Calcular raio do arco baseado no ângulo e distância
    const angleDegrees = Math.abs(segment.curve);
    const angleRadians = (angleDegrees * Math.PI) / 180;
    const dx = v1.x - v0.x;
    const dy = v1.y - v0.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius = distance / (2 * Math.sin(angleRadians / 2));
    
    // Determinar direção da curva
    const sweepFlag = segment.curve > 0 ? 1 : 0;
    
    return `  <path id="segment-${segment.v0}-${segment.v1}"
        d="M ${v0.x} ${v0.y} A ${radius} ${radius} 0 0 ${sweepFlag} ${v1.x} ${v1.y}"
        stroke="${strokeColor}" 
        stroke-width="${strokeWidth}"
        opacity="1"
        fill="none"
        stroke-linecap="round" ${showSegmentIds ? `title="Segment ${segment.v0}-${segment.v1}"` : ''}/>`;
  } else {
    // Segmento reto
    return `  <path id="segment-${segment.v0}-${segment.v1}"
        d="M ${v0.x} ${v0.y} L ${v1.x} ${v1.y}"
        stroke="${strokeColor}" 
        stroke-width="${strokeWidth}"
        opacity="1"
        fill="none"
        stroke-linecap="round" ${showSegmentIds ? `title="Segment ${segment.v0}-${segment.v1}"` : ''}/>`;
  }
}

/**
 * Gera SVG completo do mapa
 */
function generateMapSVG(mapData, options = {}) {
  const {
    backgroundColor = '#0a0a0a',
    strokeColor = '#ffffff',
    strokeWidth = 2,
    showGrid = false,
    showCenterLines = false,
    showBounds = false,
    showSegmentIds = false,
    padding = 0.1
  } = options;

  const { name, vertexes, segments } = mapData;
  
  if (!vertexes || !segments) {
    throw new Error('Map data must contain vertexes and segments');
  }

  // Calcular bounds do mapa
  const bounds = calculateMapBounds(vertexes);
  
  // Adicionar padding
  const paddingX = (bounds.maxX - bounds.minX) * padding;
  const paddingY = (bounds.maxY - bounds.minY) * padding;
  
  const viewBoxMinX = bounds.minX - paddingX;
  const viewBoxMinY = bounds.minY - paddingY;
  const viewBoxWidth = (bounds.maxX - bounds.minX) + (2 * paddingX);
  const viewBoxHeight = (bounds.maxY - bounds.minY) + (2 * paddingY);

  // Gerar elementos SVG
  let svgElements = [];
  
  // Grid
  if (showGrid) {
    svgElements.push(`
    <!-- Grid pattern -->
    <pattern id="grid" width="200" height="200" patternUnits="userSpaceOnUse">
      <path d="M 200 0 L 0 0 0 200" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    </pattern>`);
  }

  // Segments
  segments.forEach(segment => {
    const v0 = vertexes[segment.v0];
    const v1 = vertexes[segment.v1];
    
    if (v0 && v1) {
      const segmentColor = segment.color ? `#${segment.color}` : strokeColor;
      svgElements.push(generateSegmentElement(segment, v0, v1, {
        strokeColor: segmentColor,
        strokeWidth,
        showSegmentIds
      }));
    }
  });

  // Center lines
  if (showCenterLines) {
    svgElements.push(`
    <!-- Center lines -->
    <line x1="${viewBoxMinX}" y1="0" x2="${viewBoxMinX + viewBoxWidth}" y2="0" 
          stroke="rgba(255,0,0,0.2)" stroke-width="1" />
    <line x1="0" y1="${viewBoxMinY}" x2="0" y2="${viewBoxMinY + viewBoxHeight}" 
          stroke="rgba(255,0,0,0.2)" stroke-width="1" />`);
  }

  // Bounds
  if (showBounds) {
    svgElements.push(`
    <!-- Map bounds -->
    <rect x="${bounds.minX}" y="${bounds.minY}" 
          width="${bounds.maxX - bounds.minX}" height="${bounds.maxY - bounds.minY}"
          fill="none" stroke="rgba(255,255,0,0.3)" stroke-width="1" stroke-dasharray="5,5" />`);
  }

  // Metadata de coordenadas para o frontend
  const coordinateMetadata = {
    viewBox: `${viewBoxMinX} ${viewBoxMinY} ${viewBoxWidth} ${viewBoxHeight}`,
    bounds: bounds,
    padding: padding,
    generated: new Date().toISOString()
  };

  // Montar SVG completo
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     viewBox="${viewBoxMinX} ${viewBoxMinY} ${viewBoxWidth} ${viewBoxHeight}"
     width="${viewBoxWidth}" 
     height="${viewBoxHeight}"
     style="background-color: ${backgroundColor};">
  
  <!-- Metadata -->
  <title>${name} - Haxball Map</title>
  <desc>Generated from Haxball map file</desc>
  
  <!-- Coordinate metadata for frontend -->
  <metadata>
    <coordinates>${JSON.stringify(coordinateMetadata)}</coordinates>
  </metadata>
  
  <!-- Definitions -->
  <defs>${showGrid ? `
    <!-- Grid pattern -->
    <pattern id="grid" width="200" height="200" patternUnits="userSpaceOnUse">
      <path d="M 200 0 L 0 0 0 200" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
    </pattern>` : ''}
    
    <!-- Arrow marker for direction -->
    <marker id="arrowhead" markerWidth="10" markerHeight="7" 
            refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="rgba(255,255,255,0.5)" />
    </marker>
  </defs>
  
  <!-- Background grid -->
  ${showGrid ? `
  <rect x="${viewBoxMinX}" y="${viewBoxMinY}" 
        width="${viewBoxWidth}" height="${viewBoxHeight}" 
        fill="url(#grid)" />` : ''}
  
  <!-- Map segments -->
${svgElements.join('\n')}
  
</svg>`;

  return svgContent;
}

module.exports = {
  generateMapSVG,
  calculateMapBounds
};
