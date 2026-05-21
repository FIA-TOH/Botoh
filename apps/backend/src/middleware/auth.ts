import { Request, Response, NextFunction } from 'express';
import authService from '../services/authService';
import { JwtPayload } from '../services/authService';
import { getRequestLanguage, translateMessage } from '../i18n';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        role: string;
        language: 'pt' | 'en' | 'es';
      };
    }
  }
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
    language: 'pt' | 'en' | 'es';
  };
}

// Authentication middleware
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: translateMessage('Access token required', getRequestLanguage(req))
      });
      return;
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = authService.verifyToken(token);

    if (!payload) {
      res.status(401).json({
        success: false,
        message: translateMessage('Invalid or expired token', getRequestLanguage(req))
      });
      return;
    }

    // Attach user info to request
    req.user = {
      id: payload.userId,
      username: payload.username,
      role: payload.role,
      language: payload.language ?? 'pt',
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: translateMessage('Authentication failed', getRequestLanguage(req))
    });
  }
};

// Role-based access control middleware
export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: translateMessage('Authentication required', getRequestLanguage(req))
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: translateMessage('Insufficient permissions', getRequestLanguage(req))
      });
      return;
    }

    next();
  };
};

// Admin-only middleware
export const requireAdmin = requireRole(['admin']);

// Manager or admin middleware
export const requireManager = requireRole(['admin', 'manager']);

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = authService.verifyToken(token);
      
      if (payload) {
        req.user = {
          id: payload.userId,
          username: payload.username,
        role: payload.role,
        language: payload.language ?? 'pt',
        };
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Continue without auth on error
  }
};
