import { WebSocket } from 'ws';
import { WebSocketClient, WebSocketMessage, MessageHandler } from './types';
import { ConnectionManager } from './connection-manager';
import { IWebSocketContract, ILogger } from '../interfaces';
import { ConsoleLogger } from '../utilities';

export class MessageRouter {
  private handlers: Map<string, MessageHandler> = new Map();
  private contracts: Map<string, IWebSocketContract> = new Map();
  private logger: ILogger;

  constructor(_connectionManager: ConnectionManager, logger?: ILogger) {
    this.logger = logger || new ConsoleLogger();
  }

  registerHandler(eventType: string, handler: MessageHandler, contract?: IWebSocketContract): void {
    this.handlers.set(eventType, handler);
    if (contract) {
      this.contracts.set(eventType, contract);
    }
  }

  async route(client: WebSocketClient, raw: string): Promise<void> {
    try {
      const message: WebSocketMessage = JSON.parse(raw);

      const contract = this.contracts.get(message.type);
      const handler = this.handlers.get(message.type);

      if (handler) {
        await handler(client, message, contract || {
          id: '',
          name: 'dynamic',
          version: '1.0.0',
          description: '',
          tags: [],
          deprecated: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          events: [],
          channels: [],
        });
      } else {
        this.sendError(client.socket, message.id || '', `No handler for event type '${message.type}'`);
      }
    } catch (error) {
      this.logger.error('Failed to route WebSocket message', { error: String(error) });
    }
  }

  send(socket: WebSocket, type: string, payload: unknown, channel?: string): void {
    const message: WebSocketMessage = {
      type,
      payload,
      channel,
      timestamp: new Date().toISOString(),
    };

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }

  private sendError(socket: WebSocket, messageId: string, errorMessage: string): void {
    this.send(socket, 'error', { message: errorMessage, id: messageId });
  }
}
