import { Protocol } from '../interfaces';
import { IEngine } from '../interfaces';
import { RouteTarget } from './types';

export class RouteResolver {
  private engines: Map<Protocol, IEngine> = new Map();

  constructor(engines: IEngine[]) {
    for (const engine of engines) {
      this.engines.set(engine.protocol, engine);
    }
  }

  resolve(path: string, headers: Record<string, string>): RouteTarget | undefined {
    const contentType = headers['content-type'] || '';
    const accept = headers['accept'] || '';

    if (contentType.includes('graphql') || accept.includes('graphql') || path.includes('graphql')) {
      return this.resolveByProtocol('graphql');
    }

    if (this.isWebSocketUpgrade(headers)) {
      return this.resolveByProtocol('websocket');
    }

    return this.resolveByProtocol('rest');
  }

  resolveByProtocol(protocol: Protocol): RouteTarget | undefined {
    const engine = this.engines.get(protocol);
    if (!engine) return undefined;
    return { engine, protocol };
  }

  getSupportedProtocols(): Protocol[] {
    return Array.from(this.engines.keys());
  }

  private isWebSocketUpgrade(headers: Record<string, string>): boolean {
    const upgrade = headers['upgrade']?.toLowerCase() || '';
    const connection = headers['connection']?.toLowerCase() || '';
    return upgrade === 'websocket' && connection.includes('upgrade');
  }
}
