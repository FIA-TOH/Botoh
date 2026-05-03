import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface EnvironmentConfig {
  port: number;
  nodeEnv: string;
  backendUrl: string;
  frontendUrl: string;
  corsOrigin: string | string[];
  jwtSecret: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  logLevel: string;
  sentryDsn?: string | undefined;
  databaseUrl: string;
}

const config: EnvironmentConfig = {
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:3001',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key-change-in-production',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  logLevel: process.env.LOG_LEVEL || 'info',
  sentryDsn: process.env.SENTRY_DSN || undefined,
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:formulatohseason4@db.vcvthfjiyypyzhvbzkkz.supabase.co:5432/postgres',
};

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0 && config.nodeEnv === 'production') {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

export default config;
