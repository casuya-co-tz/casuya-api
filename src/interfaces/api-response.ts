import { ApiVersion, ContentType, JsonValue, ErrorCode } from './types';

export interface ApiResponse {
  status: number;
  headers: Record<string, string>;
  body: JsonValue;
  contentType: ContentType;
  version: ApiVersion;
  timing: number;
}

export interface ApiSuccessResponse<T = JsonValue> {
  success: true;
  data: T;
  meta?: {
    version: ApiVersion;
    timestamp: string;
    requestId: string;
    duration: number;
  };
}

export interface ApiErrorPayload {
  code: ErrorCode;
  message: string;
  details?: JsonValue;
  stack?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorPayload;
  meta?: {
    version: ApiVersion;
    timestamp: string;
    requestId: string;
    duration: number;
  };
}
