import { Request, Response, NextFunction } from 'express';
import { IEndpointContract, ILogger, ISerializerRegistry, IValidator } from '../interfaces';
import { ICacheProvider } from '../interfaces';
import { IMonitor } from '../interfaces';

export type ExpressMiddleware = (req: Request, res: Response, next: NextFunction) => void;

export interface RouteHandler {
  contract: IEndpointContract;
  handler: (req: Request, res: Response) => Promise<void> | void;
  middleware: ExpressMiddleware[];
}

export interface RestEngineOptions {
  port: number;
  host?: string;
  logger?: ILogger;
  serializerRegistry?: ISerializerRegistry;
  validator?: IValidator;
  cache?: ICacheProvider;
  monitor?: IMonitor;
  globalMiddleware?: ExpressMiddleware[];
  cors?: boolean;
  helmet?: boolean;
  compression?: boolean;
  bodyLimit?: string;
}
