import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import config from './config/environment';

import { setupSocketHandlers } from './socket';
import healthRoutes from './routes/health';
import authRoutes from './routes/auth';
import garageRoutes from './routes/garage';
import roomRoutes from './routes/room';
import { securityHeaders, rateLimiter, validateRequest, errorHandler, requestLogger } from './middleware/security';
import { initializeDatabase, healthCheck, closeDatabase } from './config/database';
import seedService from './config/seed';

const app = express();
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

// Security middleware
app.use(securityHeaders);
app.use(compression());
app.use(requestLogger);

// CORS configuration
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
app.use(rateLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request validation
app.use(validateRequest);

// Logging (conditional based on environment)
if (config.nodeEnv === 'development') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 400
  }));
}

// Debug middleware - log all requests
app.use((req, res, next) => {
  console.log(`➡️ Incoming: ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
console.log('🔧 Montando rotas com /api prefix...');
app.use('/health', healthRoutes);
console.log('✅ Health routes montadas');
app.use('/api/auth', authRoutes);
console.log('✅ Auth routes montadas em /api/auth');
app.use('/api/garage', garageRoutes);
console.log('✅ Garage routes montadas em /api/garage');
app.use('/api/room', roomRoutes);
console.log('✅ Room routes montadas em /api/room');
console.log('🔍 Todas as rotas montadas com /api prefix');

// 404 handler
app.use('*', (req, res) => {
  console.log('❌ Route not found:', req.method, req.originalUrl);
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Error handling (must be last)
app.use(errorHandler);

// Socket.IO setup
const { botService } = setupSocketHandlers(io);

io.on('connection', (socket: any) => {
  socket.on('register:bot', () => {
    console.log('Bot registration received');
    botService.registerBot(socket);
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
