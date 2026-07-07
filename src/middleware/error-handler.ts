import { Request, Response, NextFunction } from 'express';
import { ApiError, ConsoleLogger } from '../utilities';
import { ILogger } from '../interfaces';

export function createErrorHandler(logger?: ILogger) {
  const log = logger || new ConsoleLogger();

  return (err: Error, req: Request, res: Response, _next: NextFunction): void => {
    if (err instanceof ApiError) {
      res.status(err.statusCode).json({
        success: false,
        error: err.toJSON(),
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || '',
        },
      });
      return;
    }

    log.error('Unhandled error in middleware', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || '',
      },
    });
  };
}
