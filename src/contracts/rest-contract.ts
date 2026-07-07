import { v4 as uuidv4 } from 'uuid';
import { HttpMethod, IEndpointContract, IParameterDefinition, IResponseDefinition, IHeaderDefinition } from '../interfaces';
import { ContractOptions } from './types';

export class RestContract implements IEndpointContract {
  id: string;
  name: string;
  version: string;
  description: string;
  tags: string[];
  deprecated: boolean;
  createdAt: Date;
  updatedAt: Date;
  method: HttpMethod;
  path: string;
  requestSchema: Record<string, unknown>;
  responseSchema: Record<string, unknown>;
  parameters: IParameterDefinition[];
  headers: IHeaderDefinition[];
  responses: IResponseDefinition[];

  constructor(
    method: HttpMethod,
    path: string,
    options: ContractOptions,
  ) {
    this.id = uuidv4();
    this.method = method;
    this.path = path;
    this.name = options.name;
    this.version = options.version;
    this.description = options.description;
    this.tags = options.tags || [];
    this.deprecated = options.deprecated || false;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.requestSchema = {};
    this.responseSchema = {};
    this.parameters = [];
    this.headers = [];
    this.responses = [];
  }

  addParameter(param: IParameterDefinition): RestContract {
    this.parameters.push(param);
    this.updatedAt = new Date();
    return this;
  }

  addHeader(header: IHeaderDefinition): RestContract {
    this.headers.push(header);
    this.updatedAt = new Date();
    return this;
  }

  addResponse(response: IResponseDefinition): RestContract {
    this.responses.push(response);
    this.updatedAt = new Date();
    return this;
  }

  setRequestSchema(schema: Record<string, unknown>): RestContract {
    this.requestSchema = schema;
    this.updatedAt = new Date();
    return this;
  }

  setResponseSchema(schema: Record<string, unknown>): RestContract {
    this.responseSchema = schema;
    this.updatedAt = new Date();
    return this;
  }

  markDeprecated(): RestContract {
    this.deprecated = true;
    this.updatedAt = new Date();
    return this;
  }

  addTag(tag: string): RestContract {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
    this.updatedAt = new Date();
    return this;
  }
}
