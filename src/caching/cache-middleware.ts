import { Request, Response, NextFunction } from 'express';
import { ICacheProvider } from '../interfaces';

export function cacheMiddleware(cache: ICacheProvider, ttlMs: number = 60000) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      next();
      return;
    }

    const key = `cache:${req.originalUrl}`;
    const cached = await cache.get<string>(key);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.json(JSON.parse(cached));
      return;
    }

    const originalJson = res.json.bind(res);
    res.json = function (body: unknown) {
      cache.set(key, JSON.stringify(body), ttlMs);
      res.setHeader('X-Cache', 'MISS');
      return originalJson(body);
    } as typeof res.json;

    next();
  };
}
