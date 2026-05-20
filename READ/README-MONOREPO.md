# FTOH Haxball Bot - Monorepo Structure

## Project Overview

Fullstack monorepo for integrating a Haxball bot with real-time web interface.

## Architecture

```
FTOH-Bot/
├── apps/
│   ├── backend/     # Express API + WebSocket server
│   ├── bot/         # Haxball headless host integration
│   └── frontend/    # Next.js dashboard
├── package.json     # Root workspace configuration
└── README-MONOREPO.md
```

## Development Setup

### Prerequisites
- Node.js 18+
- npm 9+

### Installation
```bash
# Install all dependencies
npm run install:all

# Or install per workspace
npm install --workspace=apps/backend
npm install --workspace=apps/bot  
npm install --workspace=apps/frontend
```

### Development Scripts
```bash
# Start all services in development mode
npm run dev

# Start individual services
npm run dev:backend    # Port 3000
npm run dev:bot        # Haxball room
npm run dev:frontend   # Port 3000 (Next.js)
```

### Build & Production
```bash
# Build all applications
npm run build

# Build individual applications
npm run build:backend
npm run build:bot
npm run build:frontend

# Start production servers
npm run start
```

## Environment Configuration

### Backend (.env)
```env
PORT=3000
FRONTEND_URL=http://localhost:3000
```

### Bot (.env)
```env
ROOM_NAME=FTOH Bot Room
MAX_PLAYERS=12
PUBLIC=true
GEO_CODE=BR
ROOM_TOKEN=your_token_here
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Technology Stack

### Backend
- **Express.js** - REST API framework
- **Socket.IO** - Real-time WebSocket communication
- **TypeScript** - Type safety
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger

### Bot
- **haxball.js** - Haxball headless host API
- **TypeScript** - Type safety
- **WebSocket** - Communication with backend

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client

## Deployment Considerations

### Railway (Backend + Bot)
- Use `npm run build` and `npm run start`
- Configure environment variables via Railway dashboard
- Backend serves both API and WebSocket connections

### Vercel (Frontend)
- Deploy Next.js application
- Configure environment variables for API endpoints
- Automatic deployments from git

## Communication Architecture

```
Frontend ←→ Backend (Socket.IO) ←→ Bot (WebSocket/EventEmitter)
```

## Next Steps

1. **Implement WebSocket communication** between backend and bot
2. **Create bot event handlers** for game state changes
3. **Build frontend components** for real-time dashboard
4. **Add authentication** and user management
5. **Implement game statistics** and data persistence
