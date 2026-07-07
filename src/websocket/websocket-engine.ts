import http from 'http';
import { WebSocketServer, WebSocket, RawData } from 'ws';
import { IEngine, IContract, IWebSocketContract, ILogger } from '../interfaces';
import { ConsoleLogger } from '../utilities';
import { ConnectionManager } from './connection-manager';
import { MessageRouter } from './message-handler';
import { WebSocketEngineOptions } from './types';

export class WebSocketEngine implements IEngine {
  readonly protocol = 'websocket' as const;
  readonly name = 'websocket-engine';
  private wss: WebSocketServer | null = null;
  private server: http.Server | null = null;
  private connectionManager: ConnectionManager;
  private messageRouter: MessageRouter;
  private logger: ILogger;
  private options: WebSocketEngineOptions;
  private running = false;
  private heartbeatTimer: NodeJS.Timeout | null = null;

  constructor(options: WebSocketEngineOptions) {
    this.options = options;
    this.logger = options.logger || new ConsoleLogger();
    this.connectionManager = new ConnectionManager(this.logger);
    this.messageRouter = new MessageRouter(this.connectionManager, this.logger);
  }

  getConnectionManager(): ConnectionManager {
    return this.connectionManager;
  }

  getMessageRouter(): MessageRouter {
    return this.messageRouter;
  }

  registerContract(contract: IContract): void {
    if (this.isWebSocketContract(contract)) {
      this.logger.info(`Registering WebSocket contract: ${contract.name} v${contract.version}`);
      for (const event of contract.events) {
        this.messageRouter.registerHandler(event.name, async (client, _message) => {
          this.logger.debug(`WebSocket event: ${event.name} from ${client.id}`);
        }, contract);
      }
    }
  }

  async start(): Promise<void> {
    if (this.running) {
      this.logger.warn('WebSocket engine is already running');
      return;
    }

    this.server = http.createServer();
    this.wss = new WebSocketServer({
      server: this.server,
      path: this.options.path || '/ws',
      maxPayload: this.options.maxPayload || 1024 * 1024,
    });

    this.wss.on('connection', (socket: WebSocket, req) => {
      const client = this.connectionManager.addConnection(socket, {
        ip: req.socket.remoteAddress,
        headers: req.headers,
      });

      socket.on('message', (data: RawData) => {
        const raw = data.toString();
        this.messageRouter.route(client, raw);
      });

      socket.on('close', () => {
        this.connectionManager.removeConnection(client.id);
      });

      socket.on('error', (error) => {
        this.logger.error('WebSocket error', { clientId: client.id, error: error.message });
      });
    });

    this.startHeartbeat();

    return new Promise((resolve) => {
      this.server!.listen(this.options.port, this.options.host || '0.0.0.0', () => {
        this.running = true;
        this.logger.info(`WebSocket engine started on port ${this.options.port}`);
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    if (!this.running) return;

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    this.wss?.close();
    return new Promise((resolve) => {
      this.server?.close(() => {
        this.running = false;
        this.logger.info('WebSocket engine stopped');
        resolve();
      });
    });
  }

  isRunning(): boolean {
    return this.running;
  }

  private startHeartbeat(): void {
    const interval = this.options.heartbeatInterval || 30000;
    this.heartbeatTimer = setInterval(() => {
      this.connectionManager.cleanup();
    }, interval);
  }

  private isWebSocketContract(contract: IContract): contract is IWebSocketContract {
    return 'events' in contract;
  }
}
