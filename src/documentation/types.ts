import { HttpMethod, ApiVersion } from '../interfaces';

export interface ApiDocEndpoint {
  method: HttpMethod;
  path: string;
  name: string;
  version: ApiVersion;
  description: string;
  deprecated: boolean;
  tags: string[];
  parameters: ApiDocParameter[];
  headers: ApiDocHeader[];
  requestBody?: ApiDocSchema;
  responses: ApiDocResponse[];
}

export interface ApiDocParameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'body';
  required: boolean;
  type: string;
  description: string;
  example?: unknown;
}

export interface ApiDocHeader {
  name: string;
  required: boolean;
  description: string;
}

export interface ApiDocResponse {
  status: number;
  description: string;
  contentType: string;
  schema?: ApiDocSchema;
}

export interface ApiDocSchema {
  type: string;
  properties?: Record<string, ApiDocSchema>;
  items?: ApiDocSchema;
  required?: string[];
  description?: string;
}

export interface ApiDocGroup {
  tag: string;
  description: string;
  endpoints: ApiDocEndpoint[];
}
