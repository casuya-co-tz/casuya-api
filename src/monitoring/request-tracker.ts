import { Request, Response, NextFunction } from 'express';
import { IMonitor, ApiRequest, ApiResponse, HttpMethod } from '../interfaces';
import { generateRequestId } from '../utilities';

export function requestTracker(monitor: IMonitor) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();
    const requestId = generateRequestId();

    res.setHeader('X-Request-Id', requestId);

      const originalEnd = res.end;
    const _end = function (this: Response, ...args: unknown[]) {
      const duration = Date.now() - startTime;

      const apiRequest: ApiRequest = {
        id: requestId,
        method: req.method as HttpMethod,
        path: req.path,
        version: '1.0.0',
        headers: req.headers as Record<string, string>,
        query: req.query as Record<string, string | string[]>,
        params: req.params,
        body: req.body,
        contentType: req.headers['content-type'] as string || 'application/json',
        protocol: req.protocol,
        ip: req.ip || '',
        timestamp: new Date(),
        metadata: {},
      };

      const apiResponse: ApiResponse = {
        status: res.statusCode,
        headers: res.getHeaders() as Record<string, string>,
        body: res.locals.data || null,
        contentType: res.getHeader('content-type') as string || 'application/json',
        version: '1.0.0',
        timing: duration,
      };

      monitor.recordRequest(apiRequest, apiResponse, duration);
      return originalEnd.apply(this, args as any);
    };
    res.end = _end as typeof res.end;

    next();
  };
}
