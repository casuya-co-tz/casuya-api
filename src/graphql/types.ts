import { IMonitor, ICacheProvider } from '../interfaces';
import { ILogger } from '../interfaces';

export interface GraphQLContext {
  requestId: string;
  userId?: string;
  ip: string;
  timestamp: Date;
  headers: Record<string, string>;
  [key: string]: unknown;
}

export interface GraphQLEngineOptions {
  port: number;
  host?: string;
  path?: string;
  logger?: ILogger;
  cache?: ICacheProvider;
  monitor?: IMonitor;
  playground?: boolean;
  introspection?: boolean;
  cors?: boolean;
}

export interface ResolverMap {
  Query?: Record<string, (parent: unknown, args: unknown, context: GraphQLContext) => unknown>;
  Mutation?: Record<string, (parent: unknown, args: unknown, context: GraphQLContext) => unknown>;
  Subscription?: Record<string, (parent: unknown, args: unknown, context: GraphQLContext) => unknown>;
  [typeName: string]: Record<string, (parent: unknown, args: unknown, context: GraphQLContext) => unknown> | undefined;
}
