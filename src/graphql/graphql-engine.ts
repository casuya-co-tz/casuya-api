import express from 'express';
import http from 'http';
import { ApolloServer } from 'apollo-server-express';
import { IEngine, IContract, IGraphQLContract, ILogger } from '../interfaces';
import { ConsoleLogger, generateRequestId } from '../utilities';
import { SchemaBuilder } from './schema-builder';
import { GraphQLEngineOptions, GraphQLContext } from './types';

export class GraphQLEngine implements IEngine {
  readonly protocol = 'graphql' as const;
  readonly name = 'graphql-engine';
  private server: ApolloServer | null = null;
  private app: express.Application;
  private httpServer: http.Server | null = null;
  private schemaBuilder: SchemaBuilder;
  private logger: ILogger;
  private options: GraphQLEngineOptions;
  private running = false;

  constructor(options: GraphQLEngineOptions) {
    this.options = options;
    this.logger = options.logger || new ConsoleLogger();
    this.app = express();
    this.schemaBuilder = new SchemaBuilder();
  }

  registerContract(contract: IContract): void {
    if (this.isGraphQLContract(contract)) {
      this.logger.info(`Registering GraphQL contract: ${contract.name} v${contract.version}`);
      this.schemaBuilder.register(contract);
    }
  }

  getSchemaBuilder(): SchemaBuilder {
    return this.schemaBuilder;
  }

  async start(): Promise<void> {
    if (this.running) {
      this.logger.warn('GraphQL engine is already running');
      return;
    }

    const typeDefs = this.schemaBuilder.buildTypeDefs();
    const resolvers = this.schemaBuilder.buildResolvers();

    this.server = new ApolloServer({
      typeDefs: typeDefs || `type Query { health: String }`,
      resolvers: resolvers as any,
      context: ({ req }): GraphQLContext => ({
        requestId: generateRequestId(),
        ip: req.ip || '',
        timestamp: new Date(),
        headers: req.headers as Record<string, string>,
      }),
      introspection: this.options.introspection !== false,
      formatError: (err) => ({
        message: err.message,
        code: err.extensions?.code || 'INTERNAL_ERROR',
        path: err.path,
      }),
    });

    await this.server.start();
    this.server.applyMiddleware({
      app: this.app as any,
      path: this.options.path || '/graphql',
    });

    return new Promise((resolve) => {
      this.httpServer = this.app.listen(this.options.port, this.options.host || '0.0.0.0', () => {
        this.running = true;
        this.logger.info(`GraphQL engine started on port ${this.options.port}${this.options.path || '/graphql'}`);
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    if (!this.running) return;

    await this.server?.stop();

    return new Promise((resolve) => {
      this.httpServer?.close(() => {
        this.running = false;
        this.logger.info('GraphQL engine stopped');
        resolve();
      });
    });
  }

  isRunning(): boolean {
    return this.running;
  }

  private isGraphQLContract(contract: IContract): contract is IGraphQLContract {
    return 'typeDefs' in contract;
  }
}
