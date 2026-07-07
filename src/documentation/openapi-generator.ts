import { IEndpointContract } from '../interfaces';

export class OpenApiGenerator {
  private spec: Record<string, unknown>;
  private paths: Record<string, Record<string, unknown>> = {};

  constructor(title: string, version: string) {
    this.spec = {
      openapi: '3.0.3',
      info: {
        title,
        version,
        description: 'Casuya API - Reception Desk',
      },
      servers: [{ url: '/' }],
      paths: this.paths,
      components: {
        schemas: {},
      },
    };
  }

  addEndpoint(contract: IEndpointContract): void {
    const method = contract.method.toLowerCase();
    if (!this.paths[contract.path]) {
      this.paths[contract.path] = {};
    }
    const pathItem = this.paths[contract.path];

    pathItem[method] = {
      operationId: contract.name,
      summary: contract.description,
      tags: contract.tags.length > 0 ? contract.tags : undefined,
      deprecated: contract.deprecated || undefined,
      parameters: this.buildParameters(contract),
      requestBody: this.buildRequestBody(contract),
      responses: this.buildResponses(contract),
    };

    this.paths[contract.path] = pathItem;
  }

  generate(): Record<string, unknown> {
    return { ...this.spec };
  }

  private buildParameters(contract: IEndpointContract): unknown[] | undefined {
    const params = contract.parameters
      .filter(p => p.in !== 'body')
      .map(p => ({
        name: p.name,
        in: p.in,
        required: p.required,
        description: p.description,
        schema: { type: this.mapType(p.type) },
        example: p.example,
      }));

    const headers = contract.headers.map(h => ({
      name: h.name,
      in: 'header',
      required: h.required,
      description: h.description,
      schema: { type: 'string' },
    }));

    return params.length > 0 || headers.length > 0
      ? [...params, ...headers]
      : undefined;
  }

  private buildRequestBody(contract: IEndpointContract): unknown | undefined {
    const bodyParams = contract.parameters.filter(p => p.in === 'body');
    if (bodyParams.length === 0 && Object.keys(contract.requestSchema).length === 0) {
      return undefined;
    }

    return {
      required: true,
      content: {
        'application/json': {
          schema: contract.requestSchema,
        },
      },
    };
  }

  private buildResponses(contract: IEndpointContract): Record<string, unknown> {
    const responses: Record<string, unknown> = {};

    for (const response of contract.responses) {
      responses[String(response.status)] = {
        description: response.description,
        content: {
          [response.contentType]: {
            schema: response.schema || { type: 'object' },
          },
        },
      };
    }

    if (Object.keys(responses).length === 0) {
      responses['200'] = {
        description: 'Successful operation',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
              },
            },
          },
        },
      };
    }

    return responses;
  }

  private mapType(type: string): string {
    const map: Record<string, string> = {
      string: 'string',
      number: 'number',
      integer: 'integer',
      boolean: 'boolean',
      array: 'array',
      object: 'object',
    };
    return map[type] || 'string';
  }
}
