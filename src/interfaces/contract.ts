import { HttpMethod, ApiVersion, JsonValue } from './types';
import { IValidator } from './validator';

export interface IContract {
  id: string;
  name: string;
  version: ApiVersion;
  description: string;
  tags: string[];
  deprecated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEndpointContract extends IContract {
  method: HttpMethod;
  path: string;
  requestSchema: Record<string, unknown>;
  responseSchema: Record<string, unknown>;
  parameters: IParameterDefinition[];
  headers: IHeaderDefinition[];
  responses: IResponseDefinition[];
}

export interface IGraphQLContract extends IContract {
  typeDefs: string;
  resolvers: Record<string, unknown>;
  queries: string[];
  mutations: string[];
  subscriptions: string[];
}

export interface IWebSocketContract extends IContract {
  events: IWebSocketEvent[];
  channels: string[];
}

export interface IParameterDefinition {
  name: string;
  in: 'path' | 'query' | 'header' | 'body';
  required: boolean;
  type: string;
  description: string;
  defaultValue?: JsonValue;
  example?: JsonValue;
  validator?: IValidator;
}

export interface IHeaderDefinition {
  name: string;
  required: boolean;
  description: string;
  defaultValue?: string;
}

export interface IResponseDefinition {
  status: number;
  description: string;
  contentType: string;
  schema: Record<string, unknown>;
}

export interface IWebSocketEvent {
  name: string;
  direction: 'client-to-server' | 'server-to-client' | 'bidirectional';
  payload: Record<string, unknown>;
  description: string;
}
