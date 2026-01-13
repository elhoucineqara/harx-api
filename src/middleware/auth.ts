import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    iat: number;
    exp: number;
  };
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header found' });
    }

    // Extract token from "Bearer <token>" format
    const parts = authHeader.split(' ');
    const token = parts.length > 1 ? parts[1] : parts[0];
    
    if (!token) {
      return res.status(401).json({ error: 'No token found in authorization header' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('[Auth] JWT_SECRET is not defined');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string; iat: number; exp: number };
    req.user = decoded;
    next();
  } catch (error: any) {
    // Log specific error types for debugging
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    } else if (error.name === 'NotBeforeError') {
      return res.status(401).json({ error: 'Token not active yet' });
    } else {
      console.error('[Auth] Authentication error:', error.message);
      return res.status(401).json({ error: 'Authentication failed' });
    }
  }
};

// Alias pour compatibilité avec les anciennes routes
export const protect = authenticate;
export const authenticateToken = authenticate;

export const getUser = (req: Request) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    const token = parts.length > 1 ? parts[1] : parts[0];
    
    if (!token) return null;
    if (!process.env.JWT_SECRET) return null;

    return jwt.verify(token, process.env.JWT_SECRET) as { userId: string; iat: number; exp: number };
  } catch (error) {
    return null;
  }
};

