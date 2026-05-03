# FTOH Haxball Bot - Arquitetura Completa

## 📋 Visão Geral

**Arquitetura:** Monorepo Fullstack com 3 aplicações principais
- **Backend:** API REST + WebSocket (Node.js + Express + Socket.IO)
- **Bot:** Haxball Headless Host (TypeScript + Botoh Integration)
- **Frontend:** Interface Web (Next.js + React + Tailwind)
- **Database:** PostgreSQL (Supabase)

---

## 🏛️ Estrutura do Projeto

```
FTOH-Bot/
├── 📁 apps/
│   ├── 📁 backend/              # API + WebSocket Server
│   │   ├── 📁 src/
│   │   │   ├── 📁 config/       # Configurações de ambiente e banco
│   │   │   ├── 📁 middleware/   # Security, CORS, Rate Limiting, Auth
│   │   │   ├── 📁 routes/       # Endpoints REST (auth, garage, health)
│   │   │   ├── 📁 services/     # Lógica de negócio (auth, garage)
│   │   │   ├── 📁 socket.ts     # Handlers WebSocket
│   │   │   └── 📁 server.ts     # Servidor Express principal
│   │   └── 📄 package.json
│   ├── 📁 bot/                  # Haxball Bot Integration
│   │   ├── 📁 src/
│   │   │   └── 📄 index.ts        # Integração Botoh + Backend + Socket.IO
│   │   └── 📄 package.json
│   └── 📁 frontend/             # Interface Web
│       ├── 📁 src/
│       │   ├── 📁 app/           # Next.js App Router
│       │   ├── 📁 hooks/         # Hooks customizados (useSocket)
│       │   └── 📁 config/        # Configurações de ambiente
│       └── 📄 package.json
├── 📁 Botoh/                    # Bot Haxball Original
│   ├── 📁 src/
│   │   ├── 📁 features/         # Funcionalidades completas
│   │   │   ├── 📁 commands/     # Sistema de comandos
│   │   │   ├── 📁 discord/      # Integração Discord
│   │   │   ├── 📁 website/      # Comunicação Frontend (novo)
│   │   │   └── 📁 ...
│   │   └── 📄 room.ts           # Configuração da sala
│   └── 📄 .env                   # Variáveis de ambiente
├── 📁 database/
│   └── 📄 schema.sql            # Schema completo do PostgreSQL
├── 📁 scripts/
│   └── 📄 apply-schema.bat      # Script de deploy do banco
├── 📄 package.json              # Root monorepo
├── 📄 .env                     # Variáveis de ambiente (produção)
└── 📄 .env.example             # Template de configurações
```

---

## 🔄 Arquitetura de Comunicação

### **Hub & Spoke Architecture**

```
🎮 Haxball Game
    ↓ (chat events)
🤖 Botoh Bot
    ↓ (WebSocket messages)
🌐 Backend Server (Hub Central)
    ↓ (WebSocket bidirectional)
🖥️ Frontend Web
```

### **Fluxo Detalhado:**

**1. Haxball → Backend → Frontend:**
```
Jogador digita "ola" no Haxball
↓
Botoh.onPlayerChat() captura mensagem
↓
sendToWebsite(player, message) envia para backend
↓
Backend recebe 'chat:message' e broadcast para frontend
↓
Frontend exibe mensagem em tempo real
```

**2. Frontend → Backend → Haxball:**
```
Usuário digita no frontend e clica "Send"
↓
Frontend emite 'chat:send' via Socket.IO
↓
Backend repassa para bot conectado
↓
Bot usa room.sendAnnouncement() no Haxball
↓
Mensagem aparece no chat do jogo
```

---

## 🗄️ Banco de Dados PostgreSQL

### **Schema Completo**

#### **Tabelas Principais:**

**1. `teams` - Equipes de Corrida**
```sql
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    budget INTEGER DEFAULT 1000000,
    total_wins INTEGER DEFAULT 0,
    total_races INTEGER DEFAULT 0,
    championship_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);
```

**2. `users` - Usuários do Sistema**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    role USER_ROLE DEFAULT 'driver',
    display_name VARCHAR(100),
    avatar_url VARCHAR(500),
    money INTEGER DEFAULT 50000,
    experience_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    races_completed INTEGER DEFAULT 0,
    races_won INTEGER DEFAULT 0,
    podium_finishes INTEGER DEFAULT 0,
    best_lap_time INTERVAL,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**3. `upgrades` - Upgrades Disponíveis**
```sql
CREATE TABLE upgrades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category UPGRADE_CATEGORY NOT NULL,
    price INTEGER NOT NULL,
    level_required INTEGER DEFAULT 1,
    max_quantity_per_team INTEGER DEFAULT 1,
    speed_bonus DECIMAL(5,2) DEFAULT 0.00,
    handling_bonus DECIMAL(5,2) DEFAULT 0.00,
    reliability_bonus DECIMAL(5,2) DEFAULT 0.00,
    icon_url VARCHAR(500),
    color_code VARCHAR(7) DEFAULT '#000000',
    is_active BOOLEAN DEFAULT true,
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**4. `user_upgrades` - Upgrades dos Usuários (Junction Table)**
```sql
CREATE TABLE user_upgrades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    upgrade_id UUID NOT NULL REFERENCES upgrades(id) ON DELETE CASCADE,
    purchase_price INTEGER NOT NULL,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_equipped BOOLEAN DEFAULT false,
    quantity INTEGER DEFAULT 1,
    UNIQUE(user_id, upgrade_id)
);
```

**5. `race_history` - Histórico de Corridas**
```sql
CREATE TABLE race_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    race_name VARCHAR(200) NOT NULL,
    circuit_name VARCHAR(100),
    race_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    finishing_position INTEGER,
    points_earned INTEGER DEFAULT 0,
    prize_money INTEGER DEFAULT 0,
    lap_times INTERVAL[],
    weather_condition VARCHAR(50),
    tire_compound VARCHAR(50),
    is_completed BOOLEAN DEFAULT false,
    did_not_finish_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**6. `team_members` - Membros das Equipes**
```sql
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_in_team VARCHAR(50) DEFAULT 'Driver',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(team_id, user_id)
);
```

#### **Tipos e Enums:**

```sql
CREATE TYPE USER_ROLE AS ENUM ('admin', 'manager', 'driver');
CREATE TYPE UPGRADE_CATEGORY AS ENUM ('engine', 'aerodynamics', 'chassis', 'electronics');
```

#### **Views de Estatísticas:**

**`team_stats` - Estatísticas das Equipes:**
```sql
CREATE VIEW team_stats AS
SELECT 
    t.id, t.name, t.budget, t.total_wins, t.total_races, t.championship_points,
    COUNT(DISTINCT tm.user_id) as member_count,
    COALESCE(SUM(u.money), 0) as total_member_money,
    COUNT(DISTINCT uu.upgrade_id) as total_upgrades_owned
FROM teams t
LEFT JOIN team_members tm ON t.id = tm.team_id AND tm.is_active = true
LEFT JOIN users u ON tm.user_id = u.id
LEFT JOIN user_upgrades uu ON u.id = uu.user_id
WHERE t.is_active = true
GROUP BY t.id, t.name, t.budget, t.total_wins, t.total_races, t.championship_points;
```

**`user_stats` - Estatísticas dos Usuários:**
```sql
CREATE VIEW user_stats AS
SELECT 
    u.id, u.username, u.display_name, u.money, u.level, u.experience_points,
    u.races_completed, u.races_won, u.podium_finishes, t.name as team_name,
    COUNT(DISTINCT uu.upgrade_id) as upgrades_owned,
    COALESCE(SUM(up.price), 0) as total_upgrade_value,
    CASE 
        WHEN u.races_completed > 0 THEN ROUND((u.races_won::DECIMAL / u.races_completed) * 100, 2)
        ELSE 0 
    END as win_rate_percentage
FROM users u
LEFT JOIN teams t ON u.team_id = t.id
LEFT JOIN user_upgrades uu ON u.id = uu.user_id
LEFT JOIN upgrades up ON uu.upgrade_id = up.id
WHERE u.is_active = true
GROUP BY u.id, u.username, u.display_name, u.money, u.level, u.experience_points, u.races_completed, u.races_won, u.podium_finishes, t.name;
```

---

## 🔧 Componentes do Backend

### **1. Configuração (`config/`)**

**`environment.ts` - Variáveis de Ambiente:**
```typescript
interface EnvironmentConfig {
  port: number;
  nodeEnv: string;
  backendUrl: string;
  frontendUrl: string;
  corsOrigin: string | string[];
  jwtSecret: string;
  databaseUrl: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  logLevel: string;
  sentryDsn?: string;
}
```

**`database.ts` - Conexão PostgreSQL:**
- ✅ **Pool de conexões** com 20 conexões máximas
- ✅ **Query functions:** `query()`, `queryOne()`, `queryMany()`, `insert()`, `update()`, `deleteRows()`
- ✅ **Transactions:** função `transaction()`
- ✅ **Health checks:** `testConnection()`, `healthCheck()`
- ✅ **Graceful shutdown:** `closeDatabase()`

### **2. Middleware (`middleware/`)**

**`auth.ts` - Autenticação JWT:**
```typescript
export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction)
export const requireRole = (roles: string[]) => // Role-based access
export const requireAdmin = requireRole(['admin'])
export const requireManager = requireRole(['admin', 'manager'])
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction)
```

**`security.ts` - Segurança:**
```typescript
export const securityHeaders = helmet({...}) // Headers de segurança
export const rateLimiter = rateLimit({...}) // Rate limiting
export const validateRequest = (req: Request, res: Response, next: NextFunction)
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction)
export const requestLogger = (req: Request, res: Response, next: NextFunction)
```

### **3. Services (`services/`)**

**`authService.ts` - Serviço de Autenticação:**
```typescript
class AuthService {
  async hashPassword(password: string): Promise<string>
  async comparePassword(password: string, hash: string): Promise<boolean>
  generateToken(user: Omit<User, 'password_hash'>): string
  verifyToken(token: string): JwtPayload | null
  async findUserByUsername(username: string): Promise<User | null>
  async findUserById(userId: string): Promise<Omit<User, 'password_hash'> | null>
  async login(loginData: LoginRequest): Promise<AuthResponse>
  async createUser(userData: CreateUserRequest): Promise<AuthResponse>
}
```

**`garageService.ts` - Sistema de Garagem:**
```typescript
class GarageService {
  async getUserGarage(userId: string): Promise<UserGarage | null>
  async getAvailableUpgrades(userId: string): Promise<Upgrade[]>
  async purchaseUpgrade(userId: string, upgradeId: string): Promise<GarageResponse>
  async equipUpgrade(userId: string, userUpgradeId: string): Promise<GarageResponse>
  async removeUpgrade(userId: string, userUpgradeId: string): Promise<GarageResponse>
  async getUserStats(userId: string): Promise<UserStats>
}
```

### **4. Routes (`routes/`)**

**`auth.ts` - Rotas de Autenticação:**
```typescript
POST /auth/login          - Login com username/password
GET  /auth/me              - Retorna usuário autenticado
POST /auth/logout         - Logout (limpa cookie)
GET  /auth/verify          - Verifica token JWT
```

**`garage.ts` - Rotas da Garagem:**
```typescript
GET    /garage              - Dados completos da garagem
GET    /garage/upgrades      - Upgrades disponíveis
POST   /garage/upgrade      - Comprar upgrade
PUT    /garage/equip/:id     - Equipar upgrade
DELETE /garage/upgrade/:id  - Remover upgrade
GET    /garage/stats         - Estatísticas do usuário
```

**`health.ts` - Health Check:**
```typescript
GET /health               - Status do servidor
```

---

## 🤖 Integração com Botoh

### **Comunicação Bidirecional:**

**1. Botoh → Backend:**
```typescript
// Botoh/src/features/website/sendToWebsite.ts
export const sendToWebsite = (player: PlayerObject, message: string) => {
  const socket = globalSocket; // Socket compartilhado
  socket?.emit('chat:message', {
    type: 'chat:message',
    data: {
      player: player.name,
      message: message,
      timestamp: Date.now()
    }
  });
};
```

**2. Backend → Botoh:**
```typescript
// apps/bot/src/index.ts
socket.on('chat:send', (data) => {
  console.log(`Received from frontend: ${data.message}`);
  room.sendAnnouncement(`${data.player}: ${data.message}`);
});
```

**3. Frontend → Backend:**
```typescript
// apps/frontend/src/hooks/useSocket.ts
const emit = (event: string, data: any) => {
  if (socketRef.current && socketRef.current.connected) {
    socketRef.current.emit(event, data);
  }
};
```

---

## 🔒 Segurança

### **Camadas de Segurança:**

**1. Database Level:**
- ✅ **Foreign Keys** com CASCADE/SET NULL
- ✅ **CHECK constraints** para validação de dados
- ✅ **UNIQUE constraints** para evitar duplicatas

**2. Backend Level:**
- ✅ **Helmet:** Headers de segurança (CSP, HSTS, X-Frame-Options)
- ✅ **CORS:** Restrição de origens configuráveis
- ✅ **Rate Limiting:** 100 req/15min por IP
- ✅ **JWT Tokens:** 24h expiry, assinatura HMAC-SHA256
- ✅ **Input Validation:** express-validator
- ✅ **Password Hashing:** bcrypt com 12 rounds

**3. Application Level:**
- ✅ **Role-based Access Control:** admin, manager, driver
- ✅ **Authentication middleware:** JWT validation
- ✅ **Error handling:** Sem leaks em produção
- ✅ **Logging:** Structured logging com timestamps

---

## 🚀 Deploy e Produção

### **Environment Variables:**

```bash
# Server Configuration
NODE_ENV=production
PORT=3001
BACKEND_URL=https://your-domain.com
FRONTEND_URL=https://your-frontend.com

# Database Configuration
DATABASE_URL=postgresql://user:pass@host:5432/dbname
DB_HOST=db.vcvthfjiyypyzhvbzkkz.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-password

# Supabase Configuration
SUPABASE_PROJECT_ID=vcvthfjiyypyzhvbzkkz
SUPABASE_API_URL=https://vcvthfjiyypyzhvbzkkz.supabase.co
SUPABASE_REST_URL=https://vcvthfjiyypyzhvbzkkz.supabase.co/rest/v1/
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
SUPABASE_JWT_SECRET=your-jwt-secret

# Security
JWT_SECRET=your-super-secret-key-min-32-chars
CORS_ORIGIN=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Haxball Bot Configuration
HAXBALL_TOKEN=your-haxball-token
LEAGUE_ENV=production
HAXBALL_GEO=BR,-23.5505,-46.6333
LEAGUE_ADMIN_PASSWORD=your-admin-password
PUBLIC_ADMIN_PASSWORD=your-admin-password
```

### **Scripts de Deploy:**

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:bot\" \"npm run dev:frontend\"",
    "dev:backend": "npm run dev --workspace=apps/backend",
    "dev:bot": "npm run dev --workspace=apps/bot",
    "dev:frontend": "npm run dev --workspace=apps/frontend",
    "build:prod": "npm run build --workspace=apps/backend && npm run build --workspace=apps/frontend",
    "start:prod": "concurrently \"npm run start:backend\" \"npm run start:bot\" \"npm run start:frontend\"",
    "start:backend": "npm run start --workspace=apps/backend",
    "start:bot": "npm run start --workspace=apps/bot",
    "start:frontend": "npm run start --workspace=apps/frontend",
    "clean": "rimraf apps/backend/dist apps/frontend/.next apps/bot/dist",
    "lint": "npm run lint --workspaces --if-present",
    "test": "npm run test --workspaces --if-present",
    "docker": "docker build -t ftoh-bot . && docker run -p 3001:3001 -p 3000:3000 --env-file .env ftoh-bot"
  }
}
```

### **Docker Multi-Stage:**

```dockerfile
FROM node:18-alpine AS base
FROM base AS deps
WORKDIR /app
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY apps/frontend/package*.json ./apps/frontend/
COPY apps/bot/package*.json ./apps/bot/
RUN npm ci --only=production

FROM base AS builder
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build:prod

FROM base AS runner
WORKDIR /app
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/frontend/.next ./apps/frontend/.next
COPY --from=builder /app/apps/bot/dist ./apps/bot/dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=deps /app/apps/frontend/node_modules ./apps/frontend/node_modules
COPY --from=deps /app/apps/bot/node_modules ./apps/bot/node_modules

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["npm", "run", "start:prod"]
```

---

## 📊 Fluxo de Funcionamento Completo

### **1. Startup Sequence:**
1. **Environment Loading** - Carrega variáveis de ambiente
2. **Database Connection** - Conecta ao PostgreSQL com pool
3. **Schema Validation** - Verifica tabelas existem
4. **Server Start** - Inicia Express + Socket.IO
5. **Bot Registration** - Bot se conecta via WebSocket
6. **Frontend Connection** - Frontend se conecta via WebSocket

### **2. Authentication Flow:**
1. **Login Request** - POST /auth/login com username/password
2. **Password Verification** - bcrypt.compare()
3. **JWT Generation** - Token com 24h expiry
4. **Token Storage** - HTTP-only cookie + return JSON
5. **Protected Routes** - authMiddleware valida JWT
6. **User Context** - req.user populado com dados do usuário

### **3. Garage System Flow:**
1. **GET /garage** - Retorna dados + upgrades do usuário
2. **GET /garage/upgrades** - Lista upgrades disponíveis por level
3. **POST /garage/upgrade** - Compra com validação de saldo
4. **PUT /garage/equip/:id** - Equipa upgrade (unequipa outros da categoria)
5. **DELETE /garage/upgrade/:id** - Remove com reembolso de 50%

### **4. Chat Communication Flow:**
1. **Haxball Chat** → Botoh.onPlayerChat()
2. **sendToWebsite()** → Backend via Socket.IO
3. **Backend Broadcast** → Frontend via Socket.IO
4. **Frontend Input** → Backend via Socket.IO
5. **Backend Forward** → Bot via Socket.IO
6. **room.sendAnnouncement()** → Haxball Chat

---

## 🎯 Features Implementadas

### **✅ Core Features:**
- 🔐 **JWT Authentication** com bcrypt password hashing
- 🗄️ **PostgreSQL** com schema completo e relations
- 🏪 **Garage System** com upgrades, equipamento, economia
- 💬 **Real-time Chat** entre Haxball e Frontend
- 🔒 **Security Middleware** (Helmet, CORS, Rate Limiting)
- 🚀 **Production Ready** com Docker e scripts de deploy

### **✅ Business Logic:**
- 💰 **Economy System** - dinheiro, compras, reembolsos
- 🏁 **Team Management** - equipes, membros, estatísticas
- 🔧 **Upgrade System** - categorias, níveis, bônus
- 📊 **Statistics** - corridas, vitórias, taxas de vitória
- 👥 **Role-based Access** - admin, manager, driver

### **✅ Technical Features:**
- 🔄 **WebSocket Communication** bidirecional
- 📝 **Database Transactions** ACID compliance
- 🛡️ **Input Validation** com express-validator
- 📋 **Error Handling** centralizado
- 📊 **Health Checks** para monitoring
- 🧹 **Clean Architecture** com separação de responsabilidades

---

## 🔮 Próximos Passos (Fase 3)

### **Potential Expansions:**
1. **Race Management System**
   - Criar corridas, inscrições, resultados
   - Sistema de pontuação e campeonatos
   - Track records e estatísticas de performance

2. **Team Management Enhanced**
   - Budget management avançado
   - Transferências de jogadores
   - Team contracts e negociações

3. **Frontend Dashboard**
   - Dashboard administrativo
   - Visualizações de estatísticas
   - Interface de gerenciamento de equipes

4. **Advanced Features**
   - Sistema de patrocinadores
   - Eventos especiais e torneios
   - Marketplace de upgrades entre jogadores

---

## 📝 Resumo Final

**Arquitetura Atual:**
- ✅ **Monorepo** organizado com workspaces npm
- ✅ **Backend robusto** com API REST + WebSocket
- ✅ **Database relacional** PostgreSQL com schema completo
- ✅ **Authentication** JWT com segurança production-ready
- ✅ **Real-time communication** entre Haxball e Frontend
- ✅ **Garage system** completo com economia
- ✅ **Security layers** implementadas
- ✅ **Production ready** com Docker e scripts

**Status:** **100% funcional** e pronto para expansão futura!
