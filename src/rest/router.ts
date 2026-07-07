import { Router } from 'express';
import { IEndpointContract } from '../interfaces';
import { RouteHandler, ExpressMiddleware } from './types';
import { RequestHandler } from './request-handler';

export class RouteRegistrar {
  private router: Router;
  private handlers: Map<string, RouteHandler> = new Map();
  private requestHandler: RequestHandler;

  constructor(requestHandler?: RequestHandler) {
    this.router = Router();
    this.requestHandler = requestHandler || new RequestHandler();
  }

  register(
    contract: IEndpointContract,
    handler: (req: any, res: any) => Promise<void> | void,
    middleware: ExpressMiddleware[] = [],
  ): void {
    const key = `${contract.method}:${contract.path}`;

    if (this.handlers.has(key)) {
      throw new Error(`Route ${contract.method} ${contract.path} is already registered`);
    }

    this.handlers.set(key, { contract, handler, middleware });

    const method = contract.method.toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete';
    const routeMiddleware = [
      ...middleware,
      async (req: any, res: any) => {
        await this.requestHandler.handle(req, res, contract, handler);
      },
    ];

    this.router[method](contract.path, ...routeMiddleware);
  }

  getRouter(): Router {
    return this.router;
  }

  getHandlers(): RouteHandler[] {
    return Array.from(this.handlers.values());
  }

  getHandler(method: string, path: string): RouteHandler | undefined {
    return this.handlers.get(`${method}:${path}`);
  }

  hasRoute(method: string, path: string): boolean {
    return this.handlers.has(`${method}:${path}`);
  }

  removeRoute(method: string, path: string): boolean {
    return this.handlers.delete(`${method}:${path}`);
  }

  getRouteCount(): number {
    return this.handlers.size;
  }
}
