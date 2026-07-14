import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import { IEngine, IContract, ILogger } from '../interfaces';
import { ConsoleLogger } from '../utilities';
import { RouteResolver } from './route-resolver';
import { GatewayOptions } from './types';
import { createErrorHandler, requestLogger } from '../middleware';

export class Gateway implements IEngine {
  readonly protocol = 'rest' as const;
  readonly name = 'gateway';
  private app: Express;
  private server: http.Server | null = null;
  private routeResolver: RouteResolver;
  private logger: ILogger;
  private options: GatewayOptions;
  private running = false;

  constructor(options: GatewayOptions) {
    this.options = options;
    this.logger = options.logger || new ConsoleLogger();
    this.app = express();
    this.routeResolver = new RouteResolver(options.engines);
    this.setupMiddleware();
  }

  private setupMiddleware(): void {
    if (this.options.cors !== false) {
      this.app.use(cors());
    }

    if (this.options.helmet !== false) {
      this.app.use(helmet());
    }

    this.app.use(express.json({ limit: this.options.bodyLimit || '1mb' }));
    this.app.use(requestLogger(this.logger));

    this.app.get('/health', async (_req, res) => {
      const engineStatuses: Record<string, string> = {};
      for (const engine of this.options.engines) {
        engineStatuses[engine.name] = engine.isRunning() ? 'running' : 'stopped';
      }

      res.json({
        status: 'healthy',
        gateway: this.name,
        version: '1.0.0',
        uptime: process.uptime(),
        engines: engineStatuses,
        timestamp: new Date().toISOString(),
      });
    });

    this.app.use(createErrorHandler(this.logger));
  }

  registerContract(contract: IContract): void {
    this.logger.info(`Registering contract via gateway: ${contract.name} v${contract.version}`);
    for (const engine of this.options.engines) {
      engine.registerContract(contract);
    }
  }

  getRouteResolver(): RouteResolver {
    return this.routeResolver;
  }

  getEngines(): IEngine[] {
    return [...this.options.engines];
  }

  async start(): Promise<void> {
    if (this.running) {
      this.logger.warn('Gateway is already running');
      return;
    }

    for (const engine of this.options.engines) {
      await engine.start();
    }

    return new Promise((resolve) => {
      this.server = this.app.listen(this.options.port, this.options.host || '0.0.0.0', () => {
        this.running = true;
        this.logger.info(`Gateway started on port ${this.options.port}`);
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    if (!this.running) return;

    for (const engine of this.options.engines) {
      await engine.stop();
    }

    return new Promise((resolve) => {
      if (!this.server) {
        this.running = false;
        resolve();
        return;
      }
      this.server.close(() => {
        this.running = false;
        this.logger.info('Gateway stopped');
        resolve();
      });
    });
  }

  isRunning(): boolean {
    return this.running;
  }
}
