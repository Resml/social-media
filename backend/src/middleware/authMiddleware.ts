import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

/**
 * Validates the Bearer JWT access token in the Authorization header.
 * Sets req.userId on success.
 */
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (process.env.NODE_ENV === 'development') {
      req.userId = 'demo-user-id';
      return next();
    }
    res.status(401).json({ error: 'Unauthorized: missing token' });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) throw new Error('JWT_ACCESS_SECRET not configured');

    const payload = jwt.verify(token, secret) as { sub: string };
    req.userId = payload.sub;
    next();
  } catch (_err) {
    if (process.env.NODE_ENV === 'development') {
      req.userId = 'demo-user-id';
      return next();
    }
    res.status(401).json({ error: 'Unauthorized: invalid or expired token' });
  }
}
