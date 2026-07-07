import { Request, Response, NextFunction } from 'express';
import { ILogger } from '../interfaces';
import { ConsoleLogger } from '../utilities';

export function requestLogger(logger?: ILogger) {
  const log = logger || new ConsoleLogger();

  return (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      log.info('Request completed', {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });
    });

    next();
  };
}
