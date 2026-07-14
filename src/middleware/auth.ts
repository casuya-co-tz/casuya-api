import { Request, Response, NextFunction } from 'express';

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  sessionId: string;
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
    }
  }
}

export interface AuthMiddlewareConfig {
  jwtSecret: string;
  excludePaths?: string[];
}

export function createAuthMiddleware(config: AuthMiddlewareConfig) {
  const excludedPaths = new Set(config.excludePaths ?? ['/health', '/readyz', '/docs', '/openapi.json']);

  return (req: Request, res: Response, next: NextFunction): void => {
    if (excludedPaths.has(req.path) || req.path.startsWith('/docs') || req.path.startsWith('/static')) {
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authorization header required' },
      });
      return;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid authorization format. Use: Bearer <token>' },
      });
      return;
    }

    const token = parts[1];

    try {
      const jwt = require('jsonwebtoken');
      const payload = jwt.verify(token, config.jwtSecret) as {
        sub: string;
        email: string;
        role: string;
        permissions?: string[];
        sessionId?: string;
      };

      req.authUser = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role || 'student',
        permissions: payload.permissions || [],
        sessionId: payload.sessionId || '',
      };

      next();
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        res.status(401).json({
          success: false,
          error: { code: 'TOKEN_EXPIRED', message: 'Access token has expired' },
        });
      } else {
        res.status(401).json({
          success: false,
          error: { code: 'INVALID_TOKEN', message: 'Invalid access token' },
        });
      }
    }
  };
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.authUser) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    if (!roles.includes(req.authUser.role)) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: `Required role: ${roles.join(' or ')}` },
      });
      return;
    }

    next();
  };
}

export function requirePermission(...permissions: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.authUser) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const hasPermission = permissions.some(p => req.authUser!.permissions.includes(p));
    if (!hasPermission) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: `Required permission: ${permissions.join(' or ')}` },
      });
      return;
    }

    next();
  };
}
