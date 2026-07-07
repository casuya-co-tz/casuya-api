export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export type Protocol = 'rest' | 'graphql' | 'websocket';

export type ApiVersion = string;

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export type ContentType = 'application/json' | 'application/graphql' | 'text/plain' | 'application/octet-stream' | string;

export type MiddlewareFn<T = unknown> = (context: T, next: () => Promise<unknown>) => Promise<unknown>;

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'CONTRACT_VIOLATION'
  | 'VERSION_MISMATCH'
  | 'SERIALIZATION_ERROR'
  | 'INVALID_REQUEST';

export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  version: string;
  timestamp: string;
  checks: Record<string, { status: string; message?: string }>;
}
