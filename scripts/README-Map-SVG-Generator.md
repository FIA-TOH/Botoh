# Gerador de SVG para Mapas Haxball

Scripts para converter arquivos de mapa Haxball (.hbs/.json) em SVG visualizáveis com cores originais.

## 📁 Arquivos Criados

- `generate-map-svg.js` - Script básico
- `generate-map-svg-advanced.js` - Script avançado com mais opções

## 🚀 Uso Rápido

### Script Básico
```bash
node scripts/generate-map-svg.js "caminho/do/mapa.hbs" "saida.svg"
```

### Script Avançado
```bash
node scripts/generate-map-svg-advanced.js "caminho/do/mapa.hbs" "saida.svg" [opções]
```

## 📋 Exemplos

### Gerar SVG do Imola
```bash
# Básico
node scripts/generate-map-svg.js "Botoh\src\circuits\imola\imola.hbs" "imola.svg"

# Avançado com vértices
node scripts/generate-map-svg-advanced.js "Botoh\src\circuits\imola\imola.hbs" "imola-com-vertices.svg" --show-vertices

# Limpo, sem grade nem vértices
node scripts/generate-map-svg-advanced.js "Botoh\src\circuits\imola\imola.hbs" "imola-limpo.svg" --no-vertices --no-grid
```

### Outros exemplos
```bash
# Com stroke mais grosso
node scripts/generate-map-svg-advanced.js monza.hbs --stroke-width 3

# Fundo preto personalizado
node scripts/generate-map-svg-advanced.js monza.hbs --bg-color "#000000"

# Mostrar IDs dos segmentos (para debug)
node scripts/generate-map-svg-advanced.js monza.hbs --show-ids

# Sem padding
node scripts/generate-map-svg-advanced.js monza.hbs --padding 0
```

## ⚙️ Opções do Script Avançado

### Opções de Visualização
- `--show-vertices` / `--no-vertices` - Mostrar/ocultar vértices
- `--show-grid` / `--no-grid` - Mostrar/ocultar grade de fundo
- `--show-center` / `--no-center` - Mostrar/ocultar linhas centrais
- `--show-bounds` / `--no-bounds` - Mostrar/ocultar bounds do mapa
- `--show-ids` - Mostrar IDs dos segmentos

### Opções de Estilo
- `--stroke-width N` - Largura das linhas (padrão: 2)
- `--bg-color COLOR` - Cor de fundo (padrão: #0a0a0a)
- `--padding N` - Padding do mapa (padrão: 0.1 = 10%)

## 🎨 Saída Gerada

### Elementos do SVG

1. **Segmentos**
   - Linhas retas: `<line>`
   - Curvas: `<path>` com arcos SVG
   - Cores originais do mapa
   - Agrupados por trait

2. **Vértices** (opcional)
   - Círculos pequenos nas posições dos vértices
   - Cores originais
   - Útil para debug

3. **Discos** (se existirem)
   - Círculos com raios originais
   - Cores originais
   - Opacidade ajustada

4. **Elementos de Referência**
   - Grade de fundo (opcional)
   - Linhas centrais (X=0, Y=0)
   - Bounds do mapa
   - Informações do mapa

### Estrutura do SVG
```xml
<svg viewBox="..." width="..." height="...">
  <!-- Metadata -->
  <title>Nome do Mapa</title>
  
  <!-- Definitions -->
  <defs>
    <pattern id="grid">...</pattern>
    <marker id="arrowhead">...</marker>
  </defs>
  
  <!-- Background -->
  <rect fill="url(#grid)" />
  
  <!-- Reference lines -->
  <line x1="..." y1="0" /> <!-- Centro X -->
  <line x1="0" y1="..." /> <!-- Centro Y -->
  
  <!-- Map elements grouped by trait -->
  <g id="kickOffBarrier">...</g>
  <g id="wall">...</g>
  <g id="ballArea">...</g>
  
  <!-- Vertices (optional) -->
  <g id="vertices">...</g>
  
  <!-- Discs (if any) -->
  <g id="discs">...</g>
  
  <!-- Map info -->
  <text>Nome do Mapa</text>
</svg>
```

## 📊 Resultados com Imola

### Estatísticas Geradas
```
🗺️  Mapa: Autodromo Imola - By Ximb
📐 Dimensões: 4000 x 2000
📍 Vértices: 247
🔗 Segmentos: 238
⭕ Discos: 86
🥅 Gols: 0

🎉 SVG gerado com sucesso!
📊 Estatísticas:
   - Vértices: 247
   - Segmentos: 238 (161 curvos, 77 retos)
   - Discos: 86
   - Cores: 6
```

### Cores Detectadas no Imola
- `#CE2B37` - Vermelho (barreiras, kickOff)
- `#ffffff` - Branco (paredes principais)
- `#009246` - Verde (elementos decorativos)
- `#2a3b69` - Azul escuro
- `#333333` - Cinza escuro
- `#696969` - Cinza médio

## 🔧 Processo de Geração

### 1. Leitura do Mapa
- Remove comentários do arquivo
- Limpa JSON
- Parse estrutura do mapa

### 2. Cálculo de Bounds
- Encontra min/max de X/Y dos vértices
- Adiciona padding configurável
- Calcula viewBox otimizado

### 3. Geração de Elementos
- **Segmentos retos**: `<line>` com x1,y1,x2,y2
- **Segmentos curvos**: `<path>` com arcos SVG (`A rx ry`)
- **Vértices**: `<circle>` com cx,cy,r
- **Discos**: `<circle>` com raio original

### 4. Agrupamento e Otimização
- Agrupa elementos por cor
- Agrupa segmentos por trait
- Gera SVG estruturado

## 🎯 Casos de Uso

### 1. Visualização de Mapas
```bash
# Visualização completa
node scripts/generate-map-svg-advanced.js imola.hbs --show-vertices --show-grid
```

### 2. Debug de Mapas
```bash
# Debug com IDs
node scripts/generate-map-svg-advanced.js imola.hbs --show-ids --show-vertices
```

### 3. Produção (limpo)
```bash
# Versão limpa para produção
node scripts/generate-map-svg-advanced.js imola.hbs --no-vertices --no-grid --no-bounds
```

### 4. Documentação
```bash
# Versão para documentação
node scripts/generate-map-svg-advanced.js imola.hbs --show-vertices --show-bounds --stroke-width 3
```

## 🐛 Troubleshooting

### Erros Comuns

1. **Arquivo não encontrado**
   ```
   ❌ Arquivo não encontrado: caminho/do/mapa.hbs
   ```
   - Verifique se o caminho está correto
   - Use aspas duplas para caminhos com espaços

2. **JSON inválido**
   ```
   ❌ Erro ao carregar mapa: Unexpected token
   ```
   - Verifique se o arquivo HBS está formatado corretamente
   - Remova comentários não padrão

3. **Cores inválidas**
   ```
   ⚠️ Cor inválida: xyz, usando branco
   ```
   - O script automaticamente corrige cores inválidas

### Dicas

- Use o script avançado para mais controle
- `--show-vertices` é útil para debug
- `--no-grid` produz SVG mais limpo
- `--stroke-width` afeta a espessura de todas as linhas

## 📈 Performance

### Otimizações Implementadas
- Agrupamento por cor para reduzir switches de renderização
- Cálculo eficiente de bounds
- Geração incremental de SVG
- Opções para remover elementos desnecessários

### Tamanhos Típicos
- Mapa simples: ~50KB
- Mapa complexo (Imola): ~100KB
- Com vértices: +20KB
- Com grade: +5KB

## 🔄 Integração com Sistema

### Para usar no LiveMap
1. Gere o SVG com as opções desejadas
2. Coloque o arquivo na pasta pública
3. Referencie no componente LiveMap
4. Ajuste escala e posicionamento conforme necessário

### Exemplo de integração:
```typescript
const SvgMap = () => (
  <img 
    src="/maps/imola.svg" 
    alt="Imola Map"
    style={{ 
      width: '100%', 
      height: '100%',
      opacity: 0.3 
    }}
  />
);
```

## 📝 Notas Técnicas

### Coordenadas Haxball
- Range típico: -5000 a +5000
- Centro: (0, 0)
- Unidades: pixels do jogo

### Coordenadas SVG
- Usa sistema cartesiano
- Y cresce para baixo
- ViewBox calculado automaticamente

### Curvas SVG
- Usa arcos elípticos (`A rx ry`)
- `largeArcFlag`: >180° = 1, senão = 0
- `sweepFlag`: direção da curva

Os scripts estão prontos para uso e geram SVGs fiéis aos mapas originais!
