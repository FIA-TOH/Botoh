# 🏁 Race State - Modelo de Memória (Runtime)

## 🧠 Estrutura Central do Estado de Corrida

```typescript
interface RaceState {
  // 🆔 Identificação da Sessão
  sessionId: string;
  roomName: string;
  startTime: number;
  status: 'waiting' | 'starting' | 'racing' | 'finished' | 'paused';
  
  // 🏁 Informações da Corrida
  race: {
    lap: number;
    totalLaps: number;
    maxPlayers: number;
    timeLimit?: number; // em segundos
    checkpoints: number;
    mapName: string;
  };
  
  // 🌦️ Clima (3 Setores)
  weather: {
    s1: number;    // Setor 1: 0-100 (seco/molhado)
    s2: number;    // Setor 2: 0-100
    s3: number;    // Setor 3: 0-100
    forecast: {
      nextChange: number; // timestamp
      predictedS1: number;
      predictedS2: number;
      predictedS3: number;
    };
  };
  
  // 👥 Estado dos Jogadores
  players: PlayerState[];
  
  // 🏎️ Estado da Corrida em Tempo Real
  liveRace: {
    leaderId?: number;
    lastUpdate: number;
    positions: PositionState[];
    gaps: GapState[];
    pitStops: PitStopState[];
  };
  
  // 📊 Estatísticas da Sessão
  statistics: {
    overtakes: OvertakeEvent[];
    fastestLap?: LapTime;
    retirements: RetirementEvent[];
    incidents: IncidentEvent[];
  };
}
```

## 👤 Estado Individual do Jogador

```typescript
interface PlayerState {
  // 🆔 Identificação
  id: number;
  name: string;
  auth: string;
  teamId?: string; // UUID da equipe (se houver)
  
  // 🏁 Posição e Progresso
  position: number;
  gapToFront: string; // "+1.234s"
  gapToLeader: string; // "+5.678s"
  lapsCompleted: number;
  currentLapTime: number;
  
  // 🏎️ Carro e Componentes
  car: {
    model: string;
    tires: TireType;
    tireWear: {
      front: number;    // 0-100%
      rear: number;     // 0-100%
    };
    fuel: number;       // 0-100%
    kers: number;        // 0-100%
    drs: boolean;
    drsAvailable: boolean;
  };
  
  // 🎯 Performance
  performance: {
    speed: number;      // km/h atual
    topSpeed: number;   // km/h máxima na sessão
    consistency: number; // 0-100
    aggression: number;  // 0-100
  };
  
  // 📊 Histórico na Sessão
  session: {
    pitStops: number;
    penalties: Penalty[];
    lapTimes: LapTime[];
    sectors: SectorTime[];
  };
  
  // 🔧 Status
  status: 'racing' | 'pit' | 'retired' | 'disqualified';
  lastSector: number;
  inPitLane: boolean;
}
```

## 🏎️ Tipos e Enums

```typescript
// Tipos de Pneus
type TireType = 'soft' | 'medium' | 'hard' | 'wet' | 'intermediate';

interface TireData {
  type: TireType;
  grip: number;        // 0-100
  wearRate: number;    // 0-100
  optimalTemp: number; // °C
  lifespan: number;    // voltas
}

// Tempo por Volta
interface LapTime {
  lapNumber: number;
  time: number;        // em milissegundos
  sectors: [number, number, number]; // S1, S2, S3
  valid: boolean;
  fastest?: boolean;
}

// Tempo por Setor
interface SectorTime {
  sector: 1 | 2 | 3;
  time: number;
  best?: boolean;
}

// Posições
interface PositionState {
  position: number;
  playerId: number;
  gapToNext: string;
  gapToLeader: string;
  lastLapTime: number;
}

// Gaps
interface GapState {
  playerId: number;
  gapToFront: number;  // em segundos
  gapToLeader: number; // em segundos
  interval: number;    // gap para carro da frente
}

// Pit Stops
interface PitStopState {
  playerId: number;
  entryTime: number;   // timestamp
  exitTime?: number;   // timestamp
  duration?: number;   // em segundos
  tireChange: TireType;
  fuelAdded: number;
  repairs: number;
}

// Ultrapassagens
interface OvertakeEvent {
  timestamp: number;
  overtakingId: number;
  overtakenId: number;
  lap: number;
  sector: number;
  gap: number;
}

// Penalidades
interface Penalty {
  type: 'drive_through' | 'stop_go' | 'time_penalty' | 'warning';
  reason: string;
  severity: number;    // 1-5
  served?: boolean;
  servedTime?: number;
}

// Aposentadorias
interface RetirementEvent {
  playerId: number;
  timestamp: number;
  lap: number;
  reason: 'mechanical' | 'accident' | 'tire' | 'fuel' | 'retired';
  details: string;
}

// Incidentes
interface IncidentEvent {
  timestamp: number;
  type: 'collision' | 'spin' | 'off_track' | 'damage';
  players: number[];
  severity: 'minor' | 'major' | 'critical';
  description: string;
}
```

## 🔄 Estado Dinâmico (Updates)

```typescript
interface RaceUpdate {
  type: 'position' | 'lap' | 'weather' | 'pit' | 'incident' | 'retirement';
  timestamp: number;
  data: Partial<PlayerState | WeatherUpdate | PitStopUpdate>;
}

interface WeatherUpdate {
  s1: number;
  s2: number;
  s3: number;
  forecast?: {
    nextChange: number;
    predicted: [number, number, number];
  };
}

interface PitStopUpdate {
  playerId: number;
  action: 'entering' | 'exiting' | 'completed';
  tireChange?: TireType;
  fuelAdded?: number;
}
```

## 🎯 Classe RaceState Manager

```typescript
class RaceStateManager {
  private state: RaceState;
  private history: RaceState[] = [];
  
  // 🔄 Atualização de Estado
  updateRace(update: RaceUpdate): void;
  updatePlayer(playerId: number, data: Partial<PlayerState>): void;
  updateWeather(weather: WeatherUpdate): void;
  
  // 📊 Consultas
  getPlayerState(playerId: number): PlayerState | null;
  getLeaderboard(): PositionState[];
  getGaps(): GapState[];
  getWeather(): RaceState['weather'];
  
  // 🏁 Controle
  startRace(config: RaceConfig): void;
  pauseRace(): void;
  resumeRace(): void;
  finishRace(): void;
  resetRace(): void;
  
  // 📈 Análise
  calculateGaps(): GapState[];
  updatePositions(): void;
  validateLap(playerId: number, lapTime: LapTime): boolean;
  
  // 💾 Persistência (Memória)
  saveSnapshot(): void;
  restoreSnapshot(index: number): void;
  getHistory(): RaceState[];
}
```

## 🎮 Configuração Inicial

```typescript
interface RaceConfig {
  sessionId: string;
  roomName: string;
  mapName: string;
  totalLaps: number;
  maxPlayers: number;
  timeLimit?: number;
  weatherSettings: {
    initial: [number, number, number];
    variability: number;    // 0-100
    changeFrequency: number; // em minutos
  };
  tireOptions: TireType[];
  fuelStrategy: boolean;
  drsEnabled: boolean;
  damageEnabled: boolean;
}

interface RaceSession {
  config: RaceConfig;
  state: RaceState;
  manager: RaceStateManager;
  events: EventEmitter;
}
```

## 🚀 Performance e Otimização

### 📊 Update Frequency
- **Position Updates**: 10/segundo
- **Weather Updates**: 1/segundo
- **Lap Times**: Ao completar volta
- **Pit Stops**: Event-driven

### 🧠 Memory Management
- **State Size**: ~2KB por jogador
- **History**: Últimos 100 estados
- **Cleanup**: Remove estados antigos automaticamente
- **Compression**: Delta compression para histórico

### ⚡ Real-time Considerations
- **Event-driven**: Updates apenas quando necessário
- **Batching**: Agrupa múltiplos updates
- **Priority**: Position > Weather > Statistics
- **Throttling**: Limita taxa de updates por cliente

## 🔌 Integração com Socket.IO

```typescript
// Bot → Backend
socket.on('race:update', (update: RaceUpdate) => {
  raceManager.updateRace(update);
});

socket.on('race:weather', (weather: WeatherUpdate) => {
  raceManager.updateWeather(weather);
});

// Backend → Frontend
emit('race:state', state: RaceState);
emit('race:positions', positions: PositionState[]);
emit('race:weather', weather: RaceState['weather']);
emit('race:lap', lapTime: LapTime);
emit('race:pit', pitStop: PitStopState);
```

## 📋 Exemplo de Estado Completo

```typescript
const exampleRaceState: RaceState = {
  sessionId: "race_2024_05_04_001",
  roomName: "FTOH Grand Prix",
  startTime: 1714832400000,
  status: "racing",
  
  race: {
    lap: 12,
    totalLaps: 25,
    maxPlayers: 20,
    timeLimit: 1800, // 30 minutos
    checkpoints: 3,
    mapName: "Monza"
  },
  
  weather: {
    s1: 85,  // 85% seco
    s2: 60,  // 60% seco (mais molhado)
    s3: 75,  // 75% seco
    forecast: {
      nextChange: 1714833000000,
      predictedS1: 80,
      predictedS2: 55,
      predictedS3: 70
    }
  },
  
  players: [
    // ... 20 PlayerState objects
  ],
  
  liveRace: {
    leaderId: 1,
    lastUpdate: Date.now(),
    positions: [
      { position: 1, playerId: 1, gapToNext: "+2.345", gapToLeader: "0.000", lastLapTime: 81234 },
      { position: 2, playerId: 3, gapToNext: "+0.567", gapToLeader: "+2.345", lastLapTime: 81567 }
    ],
    gaps: [
      { playerId: 1, gapToFront: 0, gapToLeader: 0, interval: 0 },
      { playerId: 3, gapToFront: 2.345, gapToLeader: 2.345, interval: 2.345 }
    ],
    pitStops: []
  },
  
  statistics: {
    overtakes: [
      { timestamp: 1714832450000, overtakingId: 3, overtakenId: 2, lap: 8, sector: 2, gap: 0.123 }
    ],
    fastestLap: { lapNumber: 10, time: 79876, sectors: [26543, 25678, 27655], valid: true, fastest: true },
    retirements: [],
    incidents: []
  }
};
```

## 🎯 Regras Críticas

### ✅ **O QUE FICA EM MEMÓRIA**
- Estado atual da corrida
- Posições em tempo real
- Tempos de volta
- Clima dinâmico
- Eventos da sessão

### ❌ **O QUE NÃO FICA EM MEMÓRIA**
- Histórico de corridas (banco)
- Dados de equipes (banco)
- Economia (banco)
- Upgrades (banco)
- Usuários (banco)

### 🔄 **Sincronização**
- Bot envia updates parciais
- Backend mantém estado completo
- Frontend recebe apenas deltas
- Database não é tocado durante corrida
