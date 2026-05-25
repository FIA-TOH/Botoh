import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import config from './config/environment';

import healthRoutes from './routes/health';
import authRoutes from './routes/auth';
import garageRoutes from './routes/garage';
import roomRoutes from './routes/room';
import adminRoutes from './routes/admin';
import notificationRoutes from './routes/notifications';
import { securityHeaders, rateLimiter, validateRequest, errorHandler, requestLogger } from './middleware/security';

interface CreateAppOptions {
  includePitwallRoutes?: boolean;
}

export function createApp(options: CreateAppOptions = {}) {
  const { includePitwallRoutes = true } = options;
  const app = express();
  const corsOptions = {
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-language',
      'X-Language',
      'ngrok-skip-browser-warning',
    ],
  };

  app.use(securityHeaders);
  app.use(compression());
  app.use(requestLogger);

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  app.use(rateLimiter);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(validateRequest);

  if (config.nodeEnv === 'development') {
    app.use(morgan('combined'));
  } else {
    app.use(morgan('combined', {
      skip: (req, res) => res.statusCode < 400,
    }));
  }

  app.use((req, res, next) => {
    console.log(`Incoming: ${req.method} ${req.originalUrl}`);
    next();
  });

  app.use('/health', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/garage', garageRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/notifications', notificationRoutes);

  if (includePitwallRoutes) {
    app.use('/api/room', roomRoutes);
  }

  app.use('*', (req, res) => {
    res.status(404).json({
      error: 'Route not found',
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
    });
  });

  app.use(errorHandler);

  return app;
}

export default createApp;
