// 🏁 Race State - Modelo de Memória (Runtime)

// 🆔 Identificação da Sessão
export interface RaceState {
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

// 👤 Estado Individual do Jogador
export interface PlayerState {
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
    tire: TireType;
    tireWear: {
      front: number;    // 0-100%
      rear: number;     // 0-100%
    };
    fuel: number;       // 0-100%
    ers: number;        // 0-100%
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

// 🏎️ Tipos e Enums
export type TireType = 'soft' | 'medium' | 'hard' | 'wet' | 'intermediate';

export interface TireData {
  type: TireType;
  grip: number;        // 0-100
  wearRate: number;    // 0-100
  optimalTemp: number; // °C
  lifespan: number;    // voltas
}

// Tempo por Volta
export interface LapTime {
  lapNumber: number;
  time: number;        // em milissegundos
  sectors: [number, number, number]; // S1, S2, S3
  valid: boolean;
  fastest?: boolean;
}

// Tempo por Setor
export interface SectorTime {
  sector: 1 | 2 | 3;
  time: number;
  best?: boolean;
}

// Posições
export interface PositionState {
  position: number;
  playerId: number;
  gapToNext: string;
  gapToLeader: string;
  lastLapTime: number;
}

// Gaps
export interface GapState {
  playerId: number;
  gapToFront: number;  // em segundos
  gapToLeader: number; // em segundos
  interval: number;    // gap para carro da frente
}

// Pit Stops
export interface PitStopState {
  playerId: number;
  entryTime: number;   // timestamp
  exitTime?: number;   // timestamp
  duration?: number;   // em segundos
  tireChange: TireType;
  fuelAdded: number;
  repairs: number;
}

// Ultrapassagens
export interface OvertakeEvent {
  timestamp: number;
  overtakingId: number;
  overtakenId: number;
  lap: number;
  sector: number;
  gap: number;
}

// Penalidades
export interface Penalty {
  type: 'drive_through' | 'stop_go' | 'time_penalty' | 'warning';
  reason: string;
  severity: number;    // 1-5
  served?: boolean;
  servedTime?: number;
}

// Aposentadorias
export interface RetirementEvent {
  playerId: number;
  timestamp: number;
  lap: number;
  reason: 'mechanical' | 'accident' | 'tire' | 'fuel' | 'retired';
  details: string;
}

// Incidentes
export interface IncidentEvent {
  timestamp: number;
  type: 'collision' | 'spin' | 'off_track' | 'damage';
  players: number[];
  severity: 'minor' | 'major' | 'critical';
  description: string;
}

// 🔄 Estado Dinâmico (Updates)
export interface RaceUpdate {
  type: 'position' | 'lap' | 'weather' | 'pit' | 'incident' | 'retirement';
  timestamp: number;
  data: Partial<PlayerState | WeatherUpdate | PitStopUpdate>;
}

export interface WeatherUpdate {
  s1: number;
  s2: number;
  s3: number;
  forecast?: {
    nextChange: number;
    predicted: [number, number, number];
  };
}

export interface PitStopUpdate {
  playerId: number;
  action: 'entering' | 'exiting' | 'completed';
  tireChange?: TireType;
  fuelAdded?: number;
}

// 🎯 Classe RaceState Manager
export class RaceStateManager {
  private state: RaceState;
  private history: RaceState[] = [];
  
  constructor(initialState: Partial<RaceState> = {}) {
    this.state = {
      sessionId: initialState.sessionId || '',
      roomName: initialState.roomName || '',
      startTime: initialState.startTime || Date.now(),
      status: 'waiting',
      race: {
        lap: 0,
        totalLaps: 25,
        maxPlayers: 20,
        checkpoints: 3,
        mapName: 'default',
        ...initialState.race
      },
      weather: {
        s1: 100,
        s2: 100,
        s3: 100,
        forecast: {
          nextChange: Date.now() + 300000, // 5 minutos
          predictedS1: 95,
          predictedS2: 90,
          predictedS3: 95
        },
        ...initialState.weather
      },
      players: [],
      liveRace: {
        lastUpdate: Date.now(),
        positions: [],
        gaps: [],
        pitStops: [],
        ...initialState.liveRace
      },
      statistics: {
        overtakes: [],
        retirements: [],
        incidents: [],
        ...initialState.statistics
      }
    };
  }
  
  // 🔄 Atualização de Estado
  updateRace(update: RaceUpdate): void {
    this.state.liveRace.lastUpdate = Date.now();
    
    switch (update.type) {
      case 'position':
        this.updatePlayerFromData(update.data as Partial<PlayerState>);
        break;
      case 'weather':
        this.updateWeather(update.data as WeatherUpdate);
        break;
      case 'pit':
        this.updatePitStop(update.data as PitStopUpdate);
        break;
      // ... outros casos
    }
  }
  
  updatePlayer(playerId: number, data: Partial<PlayerState>): void {
    const playerIndex = this.state.players.findIndex(p => p.id === playerId);
    if (playerIndex !== -1) {
      this.state.players[playerIndex] = { 
        ...this.state.players[playerIndex], 
        ...data 
      };
    }
  }
  
  updateWeather(weather: WeatherUpdate): void {
    this.state.weather = {
      ...this.state.weather,
      ...weather,
      forecast: weather.forecast ? {
        ...this.state.weather.forecast,
        ...weather.forecast
      } : this.state.weather.forecast
    };
  }
  
  // 📊 Consultas
  getPlayerState(playerId: number): PlayerState | null {
    return this.state.players.find(p => p.id === playerId) || null;
  }
  
  getLeaderboard(): PositionState[] {
    return this.state.liveRace.positions;
  }
  
  getGaps(): GapState[] {
    return this.state.liveRace.gaps;
  }
  
  getWeather(): RaceState['weather'] {
    return this.state.weather;
  }
  
  // 🏁 Controle
  startRace(config: RaceConfig): void {
    this.state.status = 'racing';
    this.state.startTime = Date.now();
    this.state.race = { ...this.state.race, ...config.race };
  }
  
  pauseRace(): void {
    this.state.status = 'paused';
  }
  
  resumeRace(): void {
    this.state.status = 'racing';
  }
  
  finishRace(): void {
    this.state.status = 'finished';
  }
  
  resetRace(): void {
    this.state.status = 'waiting';
    this.state.race.lap = 0;
    this.state.players = [];
    this.state.liveRace.positions = [];
    this.state.liveRace.gaps = [];
    this.state.statistics.overtakes = [];
    this.state.statistics.retirements = [];
    this.state.statistics.incidents = [];
  }
  
  // 📈 Análise
  calculateGaps(): GapState[] {
    const positions = this.state.liveRace.positions;
    const gaps: GapState[] = [];
    
    for (let i = 0; i < positions.length; i++) {
      const current = positions[i];
      const gapToFront = i > 0 ? 
        parseFloat(positions[i-1].gapToLeader) - parseFloat(current.gapToLeader) : 0;
      
      gaps.push({
        playerId: current.playerId,
        gapToFront,
        gapToLeader: parseFloat(current.gapToLeader),
        interval: gapToFront
      });
    }
    
    return gaps;
  }
  
  updatePositions(): void {
    // Ordenar jogadores por progresso
    const sortedPlayers = [...this.state.players].sort((a, b) => {
      if (a.lapsCompleted !== b.lapsCompleted) {
        return b.lapsCompleted - a.lapsCompleted;
      }
      return a.currentLapTime - b.currentLapTime;
    });
    
    // Atualizar posições
    this.state.liveRace.positions = sortedPlayers.map((player, index) => ({
      position: index + 1,
      playerId: player.id,
      gapToNext: index > 0 ? this.calculateGap(sortedPlayers[index-1]!, player) : "0.000",
      gapToLeader: this.calculateGap(sortedPlayers[0]!, player),
      lastLapTime: player.session.lapTimes[player.session.lapTimes.length - 1]?.time || 0
    }));
  }
  
  validateLap(playerId: number, lapTime: LapTime): boolean {
    const player = this.getPlayerState(playerId);
    if (!player) return false;
    
    // Validações básicas
    if (lapTime.time < 30000) return false; // mínimo 30 segundos
    if (lapTime.time > 300000) return false; // máximo 5 minutos
    
    player.session.lapTimes.push(lapTime);
    
    // Verificar se é volta mais rápida
    if (!this.state.statistics.fastestLap || lapTime.time < this.state.statistics.fastestLap.time) {
      this.state.statistics.fastestLap = { ...lapTime, fastest: true };
    }
    
    return true;
  }
  
  // 💾 Persistência (Memória)
  saveSnapshot(): void {
    this.history.push({ ...this.state });
    if (this.history.length > 100) {
      this.history.shift(); // Remove mais antigo
    }
  }
  
  restoreSnapshot(index: number): void {
    if (index >= 0 && index < this.history.length) {
      this.state = { ...this.history[index] };
    }
  }
  
  getHistory(): RaceState[] {
    return [...this.history];
  }
  
  // Métodos privados
  private calculateGap(leader: PlayerState, follower: PlayerState): string {
    if (leader.id === follower.id) return "0.000";
    
    const leaderCurrentLap = leader.session.lapTimes[leader.session.lapTimes.length - 1]?.time || 0;
    const followerCurrentLap = follower.session.lapTimes[follower.session.lapTimes.length - 1]?.time || 0;
    
    const timeDiff = followerCurrentLap - leaderCurrentLap;
    const lapDiff = leader.lapsCompleted - follower.lapsCompleted;
    
    const totalGap = (lapDiff * 120000) + timeDiff; // 2 minutos por volta base
    return (totalGap / 1000).toFixed(3);
  }
  
  private updatePlayerFromData(data: Partial<PlayerState>): void {
    if (data.id) {
      this.updatePlayer(data.id, data);
    }
    this.updatePositions();
  }
  
  private updatePitStop(data: PitStopUpdate): void {
    const existingPit = this.state.liveRace.pitStops.find(p => p.playerId === data.playerId);
    
    if (data.action === 'entering') {
      if (!existingPit) {
        this.state.liveRace.pitStops.push({
          playerId: data.playerId,
          entryTime: Date.now(),
          tireChange: 'medium',
          fuelAdded: 0,
          repairs: 0
        });
      }
    } else if (data.action === 'exiting' && existingPit) {
      existingPit.exitTime = Date.now();
      existingPit.duration = (existingPit.exitTime - existingPit.entryTime) / 1000;
      if (data.tireChange) existingPit.tireChange = data.tireChange;
      if (data.fuelAdded) existingPit.fuelAdded = data.fuelAdded;
    }
  }
}

// 🎮 Configuração Inicial
export interface RaceConfig {
  sessionId: string;
  roomName: string;
  race: {
    mapName: string;
    totalLaps: number;
    maxPlayers: number;
    timeLimit?: number;
    checkpoints: number;
  };
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

export interface RaceSession {
  config: RaceConfig;
  state: RaceState;
  manager: RaceStateManager;
  events: any; // EventEmitter
}

// 📋 Exemplo de Estado Completo
export const exampleRaceState: RaceState = {
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
