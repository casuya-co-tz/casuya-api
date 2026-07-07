import {
  IEndpointContract,
  IGraphQLContract,
  IWebSocketContract,
  HttpMethod,
} from '../interfaces';

export type ContractType = 'rest' | 'graphql' | 'websocket';

export type AnyContract = IEndpointContract | IGraphQLContract | IWebSocketContract;

export interface ContractOptions {
  name: string;
  version: string;
  description: string;
  tags?: string[];
  deprecated?: boolean;
}

export interface EndpointOptions extends ContractOptions {
  method: HttpMethod;
  path: string;
}
