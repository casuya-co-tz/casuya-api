import { Request, Response, NextFunction } from 'express';
import { VersionResolver } from '../versioning';

export function versionMiddleware(resolver: VersionResolver) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const resolved = resolver.resolve(req.path);

    if (resolved.version) {
      (req as any).path = resolved.originalPath;
      req.params.version = resolved.version;
    }

    const headerVersion = resolver.resolveFromHeader(req.headers as Record<string, string>);
    if (headerVersion) {
      res.setHeader('X-API-Version', headerVersion);
    }

    next();
  };
}
