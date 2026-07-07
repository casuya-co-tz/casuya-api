import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import http from 'http';
import { IEngine, IContract, IEndpointContract, ILogger } from '../interfaces';
import { ConsoleLogger } from '../utilities';
import { RouteRegistrar } from './router';
import { RequestHandler } from './request-handler';
import { RestEngineOptions, ExpressMiddleware } from './types';

export class RestEngine implements IEngine {
  readonly protocol = 'rest' as const;
  readonly name = 'rest-engine';
  private app: Express;
  private server: http.Server | null = null;
  private registrar: RouteRegistrar;
  private logger: ILogger;
  private options: RestEngineOptions;
  private running = false;

  constructor(options: RestEngineOptions) {
    this.options = options;
    this.logger = options.logger || new ConsoleLogger();
    this.app = express();
    this.registrar = new RouteRegistrar(
      new RequestHandler({
        logger: this.logger as ConsoleLogger,
        validator: options.validator,
      }),
    );
    this.setupMiddleware();
  }

  private setupMiddleware(): void {
    if (this.options.cors !== false) {
      this.app.use(cors());
    }

    if (this.options.helmet !== false) {
      this.app.use(helmet());
    }

    if (this.options.compression !== false) {
      this.app.use(compression());
    }

    this.app.use(express.json({ limit: this.options.bodyLimit || '1mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    this.app.use((req, _res, next) => {
      this.logger.debug('Incoming request', {
        method: req.method,
        path: req.path,
        ip: req.ip,
      });
      next();
    });

    if (this.options.globalMiddleware) {
      for (const mw of this.options.globalMiddleware) {
        this.app.use(mw);
      }
    }
  }

  registerContract(contract: IContract): void {
    if (this.isRestContract(contract)) {
      this.logger.info(`Registering REST contract: ${contract.name} v${contract.version}`);
      this.registrar.register(contract, async (_req, res) => {
        res.locals.data = { message: `${contract.name} endpoint` };
      });
    }
  }

  registerRoute(
    contract: IEndpointContract,
    handler: (req: any, res: any) => Promise<void> | void,
    middleware: ExpressMiddleware[] = [],
  ): void {
    this.registrar.register(contract, handler, middleware);
  }

  getApp(): Express {
    return this.app;
  }

  getRegistrar(): RouteRegistrar {
    return this.registrar;
  }

  async start(): Promise<void> {
    if (this.running) {
      this.logger.warn('REST engine is already running');
      return;
    }

    this.app.use('/api', this.registrar.getRouter());

    this.app.get('/health', (_req, res) => {
      res.json({
        status: 'healthy',
        engine: this.name,
        protocol: this.protocol,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      });
    });

    return new Promise((resolve) => {
      this.server = this.app.listen(this.options.port, this.options.host || '0.0.0.0', () => {
        this.running = true;
        this.logger.info(`REST engine started on port ${this.options.port}`);
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    if (!this.running || !this.server) {
      return;
    }

    return new Promise((resolve) => {
      this.server!.close(() => {
        this.running = false;
        this.logger.info('REST engine stopped');
        resolve();
      });
    });
  }

  isRunning(): boolean {
    return this.running;
  }

  getRouteCount(): number {
    return this.registrar.getRouteCount();
  }

  private isRestContract(contract: IContract): contract is IEndpointContract {
    return 'method' in contract && 'path' in contract;
  }
}
