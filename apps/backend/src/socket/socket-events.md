# 🌐 Socket.IO Events - FTOH System

## 📋 Event Overview

O sistema FTOH utiliza Socket.IO para comunicação real-time entre três componentes principais:
- **Bot Haxball** → **Backend Hub**
- **Backend Hub** → **Frontend**
- **Backend Hub** → **Bot Haxball**

---

## 🤖 Bot → Backend Events

### 🏁 Pit Wall Events

#### `race:update`
```typescript
socket.emit('race:update', {
  type: 'position' | 'lap' | 'weather' | 'pit' | 'incident' | 'retirement',
  timestamp: number,
  data: Partial<PlayerState | WeatherUpdate | PitStopUpdate>
});
```

**Exemplos:**
```typescript
// Atualização de posição
socket.emit('race:update', {
  type: 'position',
  timestamp: 1714832400000,
  data: {
    id: 1,
    position: 2,
    gapToFront: "+1.234",
    currentLapTime: 85670
  }
});

// Mudança de clima
socket.emit('race:update', {
  type: 'weather',
  timestamp: 1714832400000,
  data: {
    s1: 85,
    s2: 60,
    s3: 75,
    forecast: {
      nextChange: 1714833000000,
      predicted: [80, 55, 70]
    }
  }
});
```

#### `race:lap`
```typescript
socket.emit('race:lap', {
  playerId: number,
  lapNumber: number,
  lapTime: number,
  sectors: [number, number, number],
  valid: boolean
});
```

#### `race:weather`
```typescript
socket.emit('race:weather', {
  s1: number,
  s2: number,
  s3: number,
  forecast?: {
    nextChange: number,
    predicted: [number, number, number]
  }
});
```

#### `race:pit`
```typescript
socket.emit('race:pit', {
  playerId: number,
  action: 'entering' | 'exiting' | 'completed',
  tireChange?: TireType,
  fuelAdded?: number,
  duration?: number
});
```

### 💬 Chat Events

#### `chat:message`
```typescript
socket.emit('chat:message', {
  playerId: number,
  playerName: string,
  message: string,
  timestamp: number,
  type: 'public' | 'team' | 'admin'
});
```

#### `chat:command`
```typescript
socket.emit('chat:command', {
  playerId: number,
  command: string,
  args: string[],
  timestamp: number
});
```

### 👥 Player Management Events

#### `player:join`
```typescript
socket.emit('player:join', {
  id: number,
  name: string,
  auth: string,
  team: number,
  conn: string
});
```

#### `player:leave`
```typescript
socket.emit('player:leave', {
  playerId: number,
  reason: 'disconnect' | 'kick' | 'ban',
  timestamp: number
});
```

#### `player:team_change`
```typescript
socket.emit('player:team_change', {
  playerId: number,
  fromTeam: number,
  toTeam: number,
  timestamp: number
});
```

---

## 🎮 Backend → Frontend Events

### 🏁 Race State Events

#### `race:state`
```typescript
socket.emit('race:state', raceState: RaceState);
```
**Frequência:** 10/segundo (apenas quando houver mudanças)

#### `race:positions`
```typescript
socket.emit('race:positions', {
  positions: PositionState[],
  timestamp: number
});
```

#### `race:weather`
```typescript
socket.emit('race:weather', {
  current: {
    s1: number,
    s2: number,
    s3: number
  },
  forecast?: {
    nextChange: number,
    predicted: [number, number, number]
  },
  timestamp: number
});
```

#### `race:lap_complete`
```typescript
socket.emit('race:lap_complete', {
  playerId: number,
  lapNumber: number,
  lapTime: number,
  sectors: [number, number, number],
  position: number,
  gap: string,
  timestamp: number
});
```

#### `race:pit_stop`
```typescript
socket.emit('race:pit_stop', {
  playerId: number,
  action: 'entering' | 'exiting' | 'completed',
  duration?: number,
  tireChange?: TireType,
  fuelAdded?: number,
  timestamp: number
});
```

#### `race:overtake`
```typescript
socket.emit('race:overtake', {
  overtakingId: number,
  overtakenId: number,
  lap: number,
  sector: number,
  gap: number,
  timestamp: number
});
```

#### `race:incident`
```typescript
socket.emit('race:incident', {
  type: 'collision' | 'spin' | 'off_track' | 'damage',
  players: number[],
  severity: 'minor' | 'major' | 'critical',
  description: string,
  timestamp: number
});
```

### 💬 Chat Events

#### `chat:message`
```typescript
socket.emit('chat:message', {
  id: string,
  playerName: string,
  message: string,
  timestamp: number,
  type: 'public' | 'team' | 'system' | 'admin'
});
```

#### `chat:command_result`
```typescript
socket.emit('chat:command_result', {
  command: string,
  success: boolean,
  message: string,
  data?: any,
  timestamp: number
});
```

### 🏎️ Team/Garage Events

#### `team:update`
```typescript
socket.emit('team:update', {
  teamId: string,
  data: {
    name?: string,
    money?: number,
    logo?: string,
    members?: TeamMember[]
  },
  timestamp: number
});
```

#### `team:upgrade_progress`
```typescript
socket.emit('team:upgrade_progress', {
  teamId: string,
  upgradeId: string,
  level: number,
  progress: number,
  finishTime: number,
  timestamp: number
});
```

#### `team:upgrade_complete`
```typescript
socket.emit('team:upgrade_complete', {
  teamId: string,
  upgradeId: string,
  newLevel: number,
  effects: any,
  timestamp: number
});
```

### 💰 Finance Events

#### `finance:update`
```typescript
socket.emit('finance:update', {
  teamId: string,
  balance: number,
  lastTransaction: {
    type: 'income' | 'expense',
    value: number,
    description: string,
    timestamp: number
  },
  timestamp: number
});
```

#### `finance:transaction`
```typescript
socket.emit('finance:transaction', {
  teamId: string,
  transaction: {
    id: string,
    type: 'income' | 'expense',
    category: string,
    value: number,
    description: string,
    timestamp: number
  }
});
```

---

## 🎯 Backend → Bot Events

### 💬 Chat Commands

#### `chat:send`
```typescript
socket.emit('chat:send', {
  message: string,
  target?: 'all' | 'team' | number | number[],
  color?: number,
  style?: string
});
```

#### `chat:announce`
```typescript
socket.emit('chat:announce', {
  title: string,
  message: string,
  type: 'info' | 'warning' | 'success' | 'error',
  duration?: number
});
```

### 🏁 Pit Wall Commands

#### `race:pit_command`
```typescript
socket.emit('race:pit_command', {
  playerId: number,
  action: 'call' | 'hold' | 'release',
  tireType?: TireType,
  fuelAmount?: number
});
```

#### `race:penalty`
```typescript
socket.emit('race:penalty', {
  playerId: number,
  type: 'drive_through' | 'stop_go' | 'time_penalty',
  reason: string,
  severity: number
});
```

#### `race:control`
```typescript
socket.emit('race:control', {
  action: 'start' | 'pause' | 'resume' | 'stop' | 'restart',
  reason?: string
});
```

### 👥 Player Management Commands

#### `player:kick`
```typescript
socket.emit('player:kick', {
  playerId: number,
  reason: string,
  duration?: number
});
```

#### `player:ban`
```typescript
socket.emit('player:ban', {
  playerId: number,
  reason: string,
  duration?: number
});
```

#### `player:move_team`
```typescript
socket.emit('player:move_team', {
  playerId: number,
  toTeam: number,
  force?: boolean
});
```

---

## 🔄 Event Flow Examples

### 🏁 Complete Race Update Flow

```typescript
// 1. Bot detecta mudança de posição
// Bot → Backend
socket.emit('race:update', {
  type: 'position',
  timestamp: 1714832400000,
  data: { id: 1, position: 2, gapToFront: "+1.234" }
});

// 2. Backend processa e atualiza estado
// Backend (internal)
raceManager.updateRace(update);

// 3. Backend broadcast para frontend
// Backend → Frontend
socket.emit('race:positions', {
  positions: [
    { position: 1, playerId: 3, gapToNext: "+1.234", ... },
    { position: 2, playerId: 1, gapToNext: "+0.567", ... }
  ],
  timestamp: 1714832400000
});
```

### 💬 Command Processing Flow

```typescript
// 1. Frontend envia comando
// Frontend → Backend
socket.emit('chat:command', {
  playerId: 1,
  command: '!pit',
  args: ['soft', '50'],
  timestamp: 1714832400000
});

// 2. Backend processa comando
// Backend (internal)
if (command === '!pit') {
  // Valida permissões, recursos, etc.
  // Envia comando para bot
  socket.emit('race:pit_command', {
    playerId: 1,
    action: 'call',
    tireType: 'soft',
    fuelAmount: 50
  });
}

// 3. Bot executa e responde
// Bot → Backend
socket.emit('race:pit', {
  playerId: 1,
  action: 'entering',
  timestamp: 1714832401000
});

// 4. Backend notifica frontend
// Backend → Frontend
socket.emit('race:pit_stop', {
  playerId: 1,
  action: 'entering',
  timestamp: 1714832401000
});
```

---

## 📊 Event Frequency & Performance

### 🏁 High Frequency Events (Race Data)
- **race:positions**: 10/segundo (apenas com mudanças)
- **race:state**: 1/segundo (delta compression)
- **race:weather**: 1/segundo

### 💬 Medium Frequency Events
- **chat:message**: Event-driven
- **race:lap**: Ao completar voltas
- **race:pit**: Event-driven

### 🔧 Low Frequency Events
- **team:update**: Quando houver mudanças
- **finance:update**: Quando houver transações
- **team:upgrade_complete**: Quando upgrade terminar

---

## 🔒 Security & Validation

### ✅ Backend Validation
- Todos os eventos do bot são validados
- Verificação de autenticidade do playerId
- Rate limiting por conexão
- Sanitização de mensagens de chat

### 🛡️ Frontend Security
- Apenas recebe eventos, não envia comandos diretos
- Validação local de timestamps
- Rate limiting de UI updates

---

## 🚀 Optimization Strategies

### 📦 Batch Processing
```typescript
// Agrupa múltiplos updates
const batch = {
  positions: [...],
  weather: {...},
  timestamps: [...]
};
socket.emit('race:batch_update', batch);
```

### 🗜️ Delta Compression
```typescript
// Envia apenas diferenças
const delta = {
  players: [
    { id: 1, position: 2 }, // apenas campos alterados
    { id: 3, gap: "+1.234" }
  ]
};
```

### 📊 Priority Queuing
- **Critical**: race:control, player:safety
- **High**: race:positions, race:incidents  
- **Medium**: chat:message, race:pit
- **Low**: team:update, finance:update
