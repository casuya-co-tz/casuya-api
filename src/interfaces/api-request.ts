import { HttpMethod, ApiVersion, ContentType, JsonValue } from './types';

export interface ApiRequest {
  id: string;
  method: HttpMethod;
  path: string;
  version: ApiVersion;
  headers: Record<string, string>;
  query: Record<string, string | string[]>;
  params: Record<string, string>;
  body?: JsonValue;
  contentType: ContentType;
  protocol: string;
  ip: string;
  timestamp: Date;
  metadata: Record<string, unknown>;
}
