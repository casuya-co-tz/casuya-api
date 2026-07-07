import { WebSocket } from 'ws';
import { WebSocketClient } from './types';
import { generateUuid } from '../utilities';
import { ILogger } from '../interfaces';

export class ConnectionManager {
  private clients: Map<string, WebSocketClient> = new Map();
  private channels: Map<string, Set<string>> = new Map();
  private logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  addConnection(socket: WebSocket, metadata: Record<string, unknown> = {}): WebSocketClient {
    const client: WebSocketClient = {
      id: generateUuid(),
      socket,
      channels: new Set(),
      connectedAt: new Date(),
      metadata,
    };

    this.clients.set(client.id, client);
    this.logger.debug(`WebSocket client connected: ${client.id}`);
    return client;
  }

  removeConnection(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    for (const channel of client.channels) {
      this.leaveChannel(clientId, channel);
    }

    this.clients.delete(clientId);
    this.logger.debug(`WebSocket client disconnected: ${clientId}`);
  }

  joinChannel(clientId: string, channel: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.channels.add(channel);

    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }
    this.channels.get(channel)!.add(clientId);
  }

  leaveChannel(clientId: string, channel: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.channels.delete(channel);
    }

    const channelClients = this.channels.get(channel);
    if (channelClients) {
      channelClients.delete(clientId);
      if (channelClients.size === 0) {
        this.channels.delete(channel);
      }
    }
  }

  getClient(clientId: string): WebSocketClient | undefined {
    return this.clients.get(clientId);
  }

  getClientsInChannel(channel: string): WebSocketClient[] {
    const clientIds = this.channels.get(channel);
    if (!clientIds) return [];
    return Array.from(clientIds)
      .map(id => this.clients.get(id))
      .filter((c): c is WebSocketClient => c !== undefined);
  }

  broadcast(channel: string, message: string, excludeClientId?: string): void {
    const clients = this.getClientsInChannel(channel);
    for (const client of clients) {
      if (client.id !== excludeClientId && client.socket.readyState === WebSocket.OPEN) {
        client.socket.send(message);
      }
    }
  }

  broadcastAll(message: string): void {
    for (const [, client] of this.clients) {
      if (client.socket.readyState === WebSocket.OPEN) {
        client.socket.send(message);
      }
    }
  }

  getConnectionCount(): number {
    return this.clients.size;
  }

  getChannelCount(): number {
    return this.channels.size;
  }

  getChannels(): string[] {
    return Array.from(this.channels.keys());
  }

  getChannelSize(channel: string): number {
    return this.channels.get(channel)?.size || 0;
  }

  getAllClients(): WebSocketClient[] {
    return Array.from(this.clients.values());
  }

  cleanup(): void {
    for (const [id, client] of this.clients) {
      if (client.socket.readyState !== WebSocket.OPEN) {
        this.removeConnection(id);
      }
    }
  }
}
