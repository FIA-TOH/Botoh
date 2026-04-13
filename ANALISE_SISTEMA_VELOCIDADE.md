# Análise: handleSpeed, gameTick e Simulação de Gravidade

## 📊 Fluxo Geral: Como Tudo Se Conecta

```
┌─────────────────────────────────────────────────────────────────┐
│                     onGameTick (60 Hz)                          │
│              [Haxball Headless Host Engine]                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   GameTick(room)                                 │
│            src/features/roomFeatures/gameTick.ts                 │
├─────────────────────────────────────────────────────────────────┤
│  1. endRaceSession()         - Verifica fim de corrida           │
│  2. updateGripCounter()      - Atualiza contador de grip         │
│  3. updateErs()              - Gerencia ERS                      │
│  4. setBallPosition()        - Posiciona a bola                  │
│  5. ▶ distributeSpeed()      - DISTRIBUI CARGA DE VELOCIDADE    │
│  6. handlePitlane()          - Gerencia pit lane                 │
│  7. checkPlayerSector()      - Detecção de setor                 │
│  8. mainLapCommand()         - Voltas                            │
│  9. Detecta cortes           - Penalidades                       │
│  10. Gerencia pneus          - Desgaste                          │
│  11. afkKick()               - Remove jogadores inativos         │
└─────────────────────────────┬──────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────┐
        │   distributeSpeed(playersAndDiscs)  │
        │   src/features/speed/distributrSpeed.ts
        ├─────────────────────────────────────┤
        │ • Conta jogadores ativos            │
        │ • Calcula processamento/frame       │
        │ • Balanceia carga:                  │
        │   - 60Hz principal                  │
        │   - Min 3 ticks por jogador         │
        │   - Redução 25% (reductionFactor)   │
        │ • Prioriza pit lane (+3x)           │
        │ • Seleciona subset de jogadores     │
        └────────────┬────────────────────────┘
                     │
                     ▼ (Passa apenas subset)
        ┌──────────────────────────────────────┐
        │   controlPlayerSpeed()               │
        │   src/features/speed/handleSpeed.ts  │
        ├──────────────────────────────────────┤
        │ Para cada jogador no subset:         │
        │  1. Calcula slipstream effect        │
        │  2. Calcula grip multiplier          │
        │  3. ▶ applyPitAndVscRules()          │
        │     → APLICA GRAVIDADE               │
        └──────────────┬───────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │   applyPitAndVscRules()              │
        │   src/features/speed/pitAndVscRules │
        ├──────────────────────────────────────┤
        │ room.setPlayerDiscProperties()       │
        │  {                                   │
        │    xgravity: -x * (1 - grip),        │
        │    ygravity: -y * (1 - grip)         │
        │  }                                   │
        │                                      │
        │ Gravidade aplica:                    │
        │ • Fricção em movimento normal       │
        │ • Pt lane: desaceleração forte      │
        │ • Safety car: 1.5% de frenagem      │
        │ • Curvas: damping lateral           │
        └──────────────────────────────────────┘
```

---

## 🎮 Detalhamento: O Que Acontece a Cada Frame (16.67ms)

### **Fase 1: GameTick é Chamado**
```typescript
// Em room.ts - linha 73
GameTick(room);  // Executado 60 vezes por segundo

// Em gameTick.ts - linha 34
export function GameTick(room: RoomObject) {
  room.onGameTick = function () {
    const playersAndDiscs = getPlayerAndDiscs(room);
    const players = getRunningPlayers(playersAndDiscs);
    
    // ... (outros processamentos)
    
    // MOMENTO CRÍTICO: Distribuir velocidade
    distributeSpeed(playersAndDiscs, room);
    
    // ... (continua com pit lane, setor, etc)
  };
}
```

---

### **Fase 2: Distribuição de Velocidade (Load Balancing)**
```typescript
// Em distributrSpeed.ts

export function distributeSpeed(
  playersAndDiscs: { p: PlayerObject; disc: DiscPropertiesObject }[],
  room: RoomObject
) {
  const players = getRunningPlayers(playersAndDiscs);
  const totalPlayers = players.length;
  
  // ====== CÁLCULO DE PROCESSAMENTO ======
  const ticksPerSecond = 60;           // Haxball roda a 60 ticks/s
  const minTicksPerPlayer = 3;         // Cada jogador precisa ser processado 3x/segundo
  const reductionFactor = 0.75;        // Redução de 25%
  
  const requiredProcessPerSecond = totalPlayers * minTicksPerPlayer;
  // Ex: 8 jogadores * 3 = 24 processamentos/segundo necessários
  
  const avgProcessPerTick = 
    (requiredProcessPerSecond / ticksPerSecond) * reductionFactor;
  // Ex: (24 / 60) * 0.75 = 0.3 processamentos/frame
  
  accumulated += avgProcessPerTick;
  const processThisTick = Math.floor(accumulated);
  accumulated -= processThisTick;
  
  // ====== SELEÇÃO DE JOGADORES ======
  const playersToProcess = [];
  
  for (let i = 0; i < processThisTick; i++) {
    const player = players[nextPlayerIndex];
    if (player) {
      const playerAndDisc = playersAndDiscs.find(
        (pd) => pd.p.id === player.p.id
      );
      
      if (playerAndDisc) {
        const playerInfo = playerList[player.p.id];
        
        // PRIORIDADE: Jogadores em pit lane são processados 3x
        if (playerInfo?.inPitlane) {
          playersToProcess.push(playerAndDisc, playerAndDisc, playerAndDisc);
        } else {
          playersToProcess.push(playerAndDisc);
        }
      }
    }
    
    // Round-robin: próximo jogador
    nextPlayerIndex = (nextPlayerIndex + 1) % totalPlayers;
  }
  
  // FINALMENTE: Aplica velocidade ao subset selecionado
  controlPlayerSpeed(playersToProcess, room);
}
```

**Lógica:**
- `📊 Distribui carga` para não sobrecarregar o processamento
- `🏁 Prioriza pit lane` (processado até 3x por frame)
- `🔄 Rotaciona entre jogadores` via round-robin
- **Resultado:** Cada jogador processado ~3x por segundo em 60 Hz

---

### **Fase 3: Cálculo de Velocidade (controlPlayerSpeed)**
```typescript
// Em handleSpeed.ts

export function controlPlayerSpeed(
  playersAndDiscsSubset: { p: PlayerObject; disc: DiscPropertiesObject }[],
  room: RoomObject
) {
  const currentTime = room.getScores()?.time || 0;
  const playersAndDiscs = getPlayerAndDiscs(room);
  const playersRunning = getRunningPlayers(playersAndDiscs);
  
  playersAndDiscsSubset.forEach(({ p, disc }) => {
    const playerInfo = playerList[p.id];
    
    // ====== 1. STOP EM PIT STOP ======
    if (playerInfo.inPitStop) {
      room.setPlayerDiscProperties(p.id, {
        xspeed: 0,
        yspeed: 0,
        xgravity: 0,
        ygravity: 0,
      });
      return;  // Skip resto do processamento
    }
    
    // ====== 2. CALCULA EFEITO SLIPSTREAM (VÁCUO) ======
    const slipstreamData = calculateSlipstreamEffect(
      p,                    // Jogador atual
      disc,                 // Propriedades do disco
      playersRunning,       // Todos os jogadores
      currentTime,
      playerInfo,
      vsc                   // Safety car ativo?
    );
    // Retorna: { effectiveSlipstream: 0.0001 } até 0.0003
    
    // ====== 3. CALCULA GRIP FINAL ======
    const gripMultiplier = calculateTotalGripMultiplier(
      p,
      disc,
      playerInfo,
      slipstreamData.effectiveSlipstream,  // ← Considera vácuo
      currentTime,
      room
    );
    // Retorna: 0.95 até 1.05 (aderência dinâmica)
    
    // ====== 4. APLICA REGRAS E GRAVIDADE ======
    applyPitAndVscRules(
      p,
      disc,
      room,
      gripMultiplier,      // ← Usa grip calculado
      playerInfo,
      currentTime,
      vsc
    );
    
    playerList[p.id] = playerInfo;
  });
}
```

---

### **Fase 4: Aplicação de Gravidade (CRUCIAL)**
```typescript
// Em pitAndVscRules.ts - AQUI É ONDE A MAGIA ACONTECE!

export function applyPitAndVscRules(
  p: PlayerObject,
  disc: DiscPropertiesObject,
  room: RoomObject,
  gripMultiplier: number,
  playerInfo: PlayerInfo,
  currentTime: number,
  vsc: boolean,
) {
  let limiter = 0;
  
  // ====== VERIFICAR LIMITADORES ======
  // 1. Em pit lane?
  if (playerInfo.inPitlane) {
    limiter = ACTUAL_CIRCUIT.info.pitSpeed ?? constants.DEFAULT_PIT_SPEED;
    // Típico: 0.97 (3% de desaceleração)
  }
  // 2. Safety car ativo?
  else if (vsc) {
    limiter = gameMode === GameMode.INDY
      ? constants.SAFETY_CAR_INDY_SPEED  // 0.993
      : constants.SAFETY_CAR_SPEED;       // 0.985 (1.5% desaceleração)
  }
  
  const { xspeed: x, yspeed: y } = disc;
  
  // ====== FORMULA DE GRAVIDADE ======
  if (limiter > 0) {
    // Pit lane ou safety car: aplicar limiter
    room.setPlayerDiscProperties(p.id, {
      xgravity: -x * (1 - limiter),      // xgravity = -(xvelocidade * fator_desaceleração)
      ygravity: -y * (1 - limiter),
    });
    // Se x=0.5 e limiter=0.97: xgravity = -0.5 * 0.03 = -0.015
  } 
  else if (gripMultiplier) {
    // Condição normal: usar grip
    room.setPlayerDiscProperties(p.id, {
      xgravity: -x * (1 - gripMultiplier),  // Fricção proporcional ao grip
      ygravity: -y * (1 - gripMultiplier),
    });
    // Se x=0.5 e grip=0.99: xgravity = -0.5 * 0.01 = -0.005
  }
}
```

---

## 🚗 Sistema de Gravidade no Haxball

### **O Que É Gravidade?**
No Haxball, `xgravity` e `ygravity` são **vetores de desaceleração** que fazem o disco perder velocidade cada frame.

### **Fórmula Base:**
$$\text{gravidade} = -\text{velocidade} \times (1 - \text{grip})$$

Onde:
- `velocidade`: velocidade atual do disco (xspeed, yspeed)
- `grip`: multiplicador de aderência (0.90 a 1.05)
- `1 - grip`: fator de fricção/desaceleração

### **Exemplos Práticos de Gravidade:**

| Situação | Velocidade | Grip | Gravidade | Resultado |
|----------|-----------|------|-----------|-----------|
| Reta seco | 0.5 | 0.99 | -0.005 | Desacelera lentamente |
| Reta molhado | 0.5 | 0.85 | -0.075 | Desacelera muito |
| Pit lane | 0.5 | 0.97 | -0.015 | Desacelera moderado |
| Safety car | 0.5 | 0.985 | -0.0075 | Desacelera pouco |
| ERS ativo | 0.5 | 1.05 | +0.025 | **ACELERA** (grip > 1) |

---

## 📈 Como Calcular Grip (Aderência)

```
┌─────────────────────────────────────────────┐
│  calculateTotalGripMultiplier()              │
├─────────────────────────────────────────────┤
│ 1. Base: tipo de pneu + condição clima     │
│    - Seco (chuva=0%): 0.99 a 1.0           │
│    - Molhado (chuva=100%): 0.85 a 0.9      │
│    - Transição: interpolado                │
│                                             │
│ 2. Desgaste: quanto mais gasto, menos grip │
│    - 0% desgaste: grip * 1.0               │
│    - 100% desgaste: grip * 0.7             │
│                                             │
│ 3. ERS: quando ativo, aumenta grip         │
│    - ERS ativo: grip += 0.02               │
│    - ERS vazio: grip -= 0.006              │
│                                             │
│ 4. Slipstream: vácuo melhora grip          │
│    - Perto do carro = +0.0003 extra        │
│                                             │
│ 5. Penalidades: corte diminui grip         │
│    - Cut penalty: grip * 0.8 por 5 seg     │
│                                             │
│ ▶ Resultado Final: gripMultiplier (0.7-1.1)
└─────────────────────────────────────────────┘
```

---

## 🎯 Simulação de Mudança de Velocidade com Gravidade

### **Método 1: Simulação Manual Sem Haxball**
Para testar antes de aplicar no jogo:

```typescript
interface DiscState {
  xspeed: number;
  yspeed: number;
  xgravity: number;
  ygravity: number;
}

function simulatePhysics(
  disc: DiscState,
  iterations: number = 1
): DiscState {
  for (let i = 0; i < iterations; i++) {
    // Cada iteração = 1 frame (16.67ms a 60Hz)
    disc.xspeed += disc.xgravity;
    disc.yspeed += disc.ygravity;
  }
  return disc;
}

// Exemplo 1: Desaceleração normal (grip 0.99)
let disc1: DiscState = {
  xspeed: 0.5,
  yspeed: 0.3,
  xgravity: -0.5 * (1 - 0.99),  // -0.005
  ygravity: -0.3 * (1 - 0.99),  // -0.003
};

console.log("Frame 0:", disc1);
console.log("Frame 1:", simulatePhysics({ ...disc1 }, 1));
// Frame 1: { xspeed: 0.495, yspeed: 0.297, ... }

// Exemplo 2: Chuva (grip 0.85)
let disc2: DiscState = {
  xspeed: 0.5,
  yspeed: 0.3,
  xgravity: -0.5 * (1 - 0.85),  // -0.075
  ygravity: -0.3 * (1 - 0.85),  // -0.045
};

console.log("Chuva Frame 1:", simulatePhysics({ ...disc2 }, 1));
// Frame 1: { xspeed: 0.425, yspeed: 0.255, ... } (desacelera 15% vs 1%)
```

---

### **Método 2: Aplicar Dinâmicamente no Jogo**

O seu código já faz isso na linha 20-27 de **pitAndVscRules.ts**:

```typescript
// Seu sistema atual:
room.setPlayerDiscProperties(p.id, {
  xgravity: -x * (1 - gripMultiplier),
  ygravity: -y * (1 - gripMultiplier),
});

// Haxball aplica automaticamente a cada frame:
// xspeed += xgravity
// yspeed += ygravity
```

---

### **Método 3: Simulação com Curvas (Damping Lateral)**

```typescript
// Se há mudança de direção > 8.5°, adicione damping lateral
function applyDampingOnCurves(
  disc: DiscState,
  angleChange: number,
  dampingFactor: number = 0.05
): DiscState {
  if (angleChange > 8.5) {
    // Perpendicular ao movimento
    const perpX = -disc.yspeed;
    const perpY = disc.xspeed;
    
    disc.xgravity += perpX * dampingFactor;
    disc.ygravity += perpY * dampingFactor;
  }
  return disc;
}
```

---

## 📊 Constantes do Sistema

```typescript
// Em constants.ts

export const constants = {
  // Velocidade e Performance
  NORMAL_SPEED: 1,
  DRS_SPEED_GAIN: 0.001,
  ERS_PENALTY: -0.006,
  JUMP_START_PENALTY: -0.005,
  FULL_GAS_SPEED: 0.00025,
  ZERO_GAS_PENALTY: 0.005,
  PENALTY_SPEED: 0.97,
  
  // Pit Lane e Safety Car
  DEFAULT_PIT_SPEED: 0.97,           // 3% desaceleração
  SAFETY_CAR_SPEED: 0.985,           // 1.5% desaceleração
  SAFETY_CAR_INDY_SPEED: 0.993,      // 0.7% desaceleração
  
  // Slipstream (vácuo)
  MAX_SLIPSTREAM: 0.0003,            // Máximo de aceleração extra
  RESIDUAL_SLIPSTREAM_TIME: 2.2,     // Tempo residual (segundos)
  SLIPSTREAM_ACTIVATION_DISTANCE: 600,
  SLIPSTREAM_LATERAL_TOLERANCE: 38,
  
  // Chuva
  SLIDE_FACTOR: 2.5,                 // Multiplicador de deslizamento
};
```

---

## 🔧 Fluxo Completo de Um Jogador

### **Segundo 1.000 (Frame 60)**

```
1. onGameTick chamado
   ↓
2. GameTick() inicia
   ↓
3. distributeSpeed() 
   → Verifica: 8 jogadores, precisa ~0.3 processamento/frame
   → Seleciona 1 jogador (porque Math.floor(0.3) = 0)
   
4. controlPlayerSpeed([Player_1, disc_1])
   → slipstreamData = Sem vácuo (0.0)
   → gripMultiplier = 0.99 (seco, sem desgaste)
   
5. applyPitAndVscRules()
   → Não em pit lane
   → Sem safety car
   → limiter = 0
   → Aplica:
      xgravity = -0.5 * (1 - 0.99) = -0.005
      ygravity = -0.3 * (1 - 0.99) = -0.003
   
6. Haxball engine:
   → xspeed = 0.5 + (-0.005) = 0.495
   → yspeed = 0.3 + (-0.003) = 0.297
   
7. Próximo frame, gravidade recalculada com nova velocidade

Resultado: Desaceleração realista ✓
```

---

## ⚠️ Pontos Críticos para Entender

### **1. Por que 60 Hz?**
- Haxball roda 60 ticks por segundo
- Cada tick = 16.67 ms
- Alterações de gravidade têm efeito imediato

### **2. Por que distribuir carga?**
- Processar todos os jogadores a cada frame = pesado
- Com 8 jogadores: só 0.3 processam por frame
- Mas cada um processa ~3x por segundo
- Resultado: efeito suave mesmo sem processamento contínuo

### **3. Pit lane tem prioridade?**
- Jogadores em pit lane: processados 3x por frame
- Jogadores normais: 1x por frame (em média)
- Garante que pit limiter seja respeitado rigorosamente

### **4. Gravidade é contínua?**
- SIM! Se você não recalcular, o jogador continua desacelerando
- Portanto, velocidade é recalculada dinamicamente
- Cada jogador pode ter gravidade diferente

---

## 🎬 Caso de Uso: Implementar Frenagem em Curva

Você quer adicionar frenagem automática em curvas (como F1 real):

```typescript
// Em um novo arquivo: features/speed/curveDeceleration.ts

export function calculatCurveDeceleration(
  playerPosition: { x: number; y: number },
  playerVelocity: { xspeed: number; yspeed: number },
  trackGeometry: { radiusCurve: number }  // raio da curva
) {
  const speed = Math.hypot(playerVelocity.xspeed, playerVelocity.yspeed);
  
  // Velocidade máxima na curva = sqrt(grip * gravidade * raio)
  // Simplificado: maxSpeed = raio * 0.3
  const maxSpeedInCurve = trackGeometry.radiusCurve * 0.3;
  
  if (speed > maxSpeedInCurve) {
    // Aplicar gravidade extra para frear
    const excessSpeed = speed - maxSpeedInCurve;
    const brakeFactor = 0.1 * excessSpeed;  // Intensidade da frenagem
    
    return {
      xgravity: -(playerVelocity.xspeed / speed) * brakeFactor,
      ygravity: -(playerVelocity.yspeed / speed) * brakeFactor,
    };
  }
  
  return { xgravity: 0, ygravity: 0 };
}
```

Depois, em `applyPitAndVscRules.ts`:
```typescript
// Adicionar ANTES de aplicar gravidade normal:
const curveDecel = calculateCurveDeceleration(
  p.position,
  { xspeed: x, yspeed: y },
  getCurrentCurveInfo()  // você implementa
);

if (curveDecel.xgravity !== 0) {
  room.setPlayerDiscProperties(p.id, curveDecel);
  return;  // Não aplicar gravidade normal
}
```

---

## 📚 Arquivo de Referência

| Arquivo | Função Principal | Linhas |
|---------|------------------|--------|
| [gameTick.ts](src/features/roomFeatures/gameTick.ts#L34) | Loop principal 60 Hz | 34-90 |
| [handleSpeed.ts](src/features/speed/handleSpeed.ts#L7) | Orquestra cálculos | 7-58 |
| [pitAndVscRules.ts](src/features/speed/pitAndVscRules.ts#L5) | **Aplica gravidade** | 5-29 |
| [distributrSpeed.ts](src/features/speed/distributrSpeed.ts#L7) | Distribuição de carga | 7-51 |
| [constants.ts](src/features/speed/constants.ts#L1) | Constantes do sistema | 1-42 |

---

## 🎓 Resumo em Uma Sentença

**A cada frame (60x/segundo), `GameTick` balanceia a carga entre jogadores, `handleSpeed` calcula o grip baseado em pneus/clima/ERS, e `applyPitAndVscRules` aplica gravidade proporcional ao grip para simular fricção realista.**

