import { createServer } from 'http';
import { Server } from 'socket.io';
import config from './config/environment';

import { createApp } from './app';
import { setupSocketHandlers } from './socket';
import roomService from './services/roomService';
import { initializeDatabase, healthCheck, closeDatabase } from './config/database';
import seedService from './config/seed';
import migrationService from './config/migrations';

const app = createApp({ includePitwallRoutes: true });
const server = createServer(app);

// Socket.IO configuration with security
const io = new Server(server, {
  cors: {
    origin: config.corsOrigin,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  maxHttpBufferSize: 1e8, // 100 MB
  pingTimeout: 60000,
  pingInterval: 25000
});

const { botService, isAuthorizedBot } = setupSocketHandlers(io);

io.on('connection', (socket: any) => {
  socket.on('register:bot', (data?: { token?: string }) => {
    if (!isAuthorizedBot(data, socket)) {
      console.warn('Rejected bot registration: invalid BOT_SOCKET_TOKEN');
      socket.disconnect(true);
      return;
    }

    console.log('Bot registration received');
    botService.registerBot(socket);
    socket.on('disconnect', () => {
      roomService.markRoomOffline();
      io.emit('room:offline', {
        timestamp: Date.now(),
      });
    });
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database connection
    console.log(' Initializing database connection...');
    await initializeDatabase();
    
    // Check database health
    const dbHealth = await healthCheck();
    console.log(' Database health check:', dbHealth);
    
    // Run database seeds (create admin user, basic upgrades, etc.)
    if (dbHealth.connected) {
      console.log(' Running database migrations...');
      await migrationService.ensureAdminSchema();
      console.log(' Running database seeds...');
      await seedService.runSeeds();
    } else {
      console.warn(' Skipping database seeds - database not connected');
    }
    
    // Start server
    server.listen(config.port, () => {
      console.log(` Backend server running on port ${config.port}`);
      console.log(` Environment: ${config.nodeEnv}`);
      console.log(` Backend URL: ${config.backendUrl}`);
      console.log(` Frontend URL: ${config.frontendUrl}`);
      console.log(` Database: ${dbHealth.connected ? 'Connected' : 'Disconnected'}`);
      
      if (!dbHealth.connected) {
        console.warn(' Database connection failed - some features may not work');
      }
    });
  } catch (error) {
    console.error(' Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(async () => {
    await closeDatabase();
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(async () => {
    await closeDatabase();
    console.log('Process terminated');
    process.exit(0);
  });
});

// Start the server
startServer();
