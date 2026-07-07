import { Protocol } from '../interfaces';
import { IEngine } from '../interfaces';
import { ILogger } from '../interfaces';
import { IMonitor } from '../interfaces';
import { ICacheProvider } from '../interfaces';
import { RateLimiter } from '../middleware';

export interface GatewayOptions {
  port: number;
  host?: string;
  logger?: ILogger;
  monitor?: IMonitor;
  cache?: ICacheProvider;
  rateLimiter?: RateLimiter;
  engines: IEngine[];
  cors?: boolean;
  helmet?: boolean;
  bodyLimit?: string;
}

export interface RouteTarget {
  engine: IEngine;
  protocol: Protocol;
}
