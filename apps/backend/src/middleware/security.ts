import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import compression from 'compression';
import { Request, Response, NextFunction } from 'express';
import config from '../config/environment';
import { getRequestLanguage, translateMessage } from '../i18n';

// Rate limiting configuration
export const rateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  handler: (req, res) => {
    res.status(429).json({
      error: translateMessage('Too many requests from this IP, please try again later.', getRequestLanguage(req)),
      retryAfter: Math.ceil(config.rateLimitWindowMs / 1000),
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true,
});

// Security headers configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Request validation middleware
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  // Validate Content-Type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && !req.is('application/json')) {
    return res.status(400).json({
      error: translateMessage('Invalid Content-Type. Expected application/json', getRequestLanguage(req))
    });
  }

  // Add request timestamp
  req.requestTime = new Date().toISOString();
  
  next();
};

// Error handling middleware
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[${new Date().toISOString()}] Error:`, err);

  // Don't leak error details in production
  const message = config.nodeEnv === 'production' 
    ? translateMessage('Internal Server Error', getRequestLanguage(req))
    : err.message;

  res.status(500).json({
    error: message,
    timestamp: new Date().toISOString(),
    path: req.path
  });
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};
