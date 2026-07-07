import { IEndpointContract, IGraphQLContract, IWebSocketContract } from '../interfaces';
import { ApiDocEndpoint, ApiDocGroup } from './types';
import { OpenApiGenerator } from './openapi-generator';

export class ApiDocs {
  private restContracts: IEndpointContract[] = [];
  private graphqlContracts: IGraphQLContract[] = [];
  private websocketContracts: IWebSocketContract[] = [];

  addRestContract(contract: IEndpointContract): void {
    this.restContracts.push(contract);
  }

  addGraphQLContract(contract: IGraphQLContract): void {
    this.graphqlContracts.push(contract);
  }

  addWebSocketContract(contract: IWebSocketContract): void {
    this.websocketContracts.push(contract);
  }

  getRestEndpoints(): ApiDocEndpoint[] {
    return this.restContracts.map(c => ({
      method: c.method,
      path: c.path,
      name: c.name,
      version: c.version,
      description: c.description,
      deprecated: c.deprecated,
      tags: c.tags,
      parameters: c.parameters.map(p => ({
        name: p.name,
        in: p.in,
        required: p.required,
        type: p.type,
        description: p.description,
        example: p.example,
      })),
      headers: c.headers.map(h => ({
        name: h.name,
        required: h.required,
        description: h.description,
      })),
      responses: c.responses.map(r => ({
        status: r.status,
        description: r.description,
        contentType: r.contentType,
      })),
    }));
  }

  getGroups(): ApiDocGroup[] {
    const groups = new Map<string, ApiDocGroup>();

    for (const endpoint of this.getRestEndpoints()) {
      for (const tag of endpoint.tags) {
        if (!groups.has(tag)) {
          groups.set(tag, {
            tag,
            description: `Endpoints related to ${tag}`,
            endpoints: [],
          });
        }
        groups.get(tag)!.endpoints.push(endpoint);
      }
    }

    return Array.from(groups.values());
  }

  toOpenApi(title: string, version: string): Record<string, unknown> {
    const generator = new OpenApiGenerator(title, version);

    for (const contract of this.restContracts) {
      generator.addEndpoint(contract);
    }

    return generator.generate();
  }

  getRestContractCount(): number {
    return this.restContracts.length;
  }

  getGraphQLContractCount(): number {
    return this.graphqlContracts.length;
  }

  getWebSocketContractCount(): number {
    return this.websocketContracts.length;
  }

  clear(): void {
    this.restContracts = [];
    this.graphqlContracts = [];
    this.websocketContracts = [];
  }
}
