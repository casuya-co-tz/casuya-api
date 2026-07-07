import { Protocol } from './types';
import { ApiRequest } from './api-request';
import { ApiResponse } from './api-response';

export interface IMonitor {
  readonly name: string;
  recordRequest(request: ApiRequest, response: ApiResponse, duration: number): void;
  recordError(error: Error, context: Record<string, unknown>): void;
  recordMetric(name: string, value: number, tags?: Record<string, string>): void;
  getMetrics(): Promise<MetricsSnapshot>;
}

export interface MetricsSnapshot {
  timestamp: string;
  uptime: number;
  requests: RequestMetrics;
  errors: ErrorMetrics;
  cache: CacheMetrics;
  system: SystemMetrics;
}

export interface RequestMetrics {
  total: number;
  byProtocol: Record<Protocol, number>;
  byStatus: Record<string, number>;
  byEndpoint: Record<string, number>;
  averageDuration: number;
  p95Duration: number;
  p99Duration: number;
}

export interface ErrorMetrics {
  total: number;
  byType: Record<string, number>;
  byEndpoint: Record<string, number>;
}

export interface CacheMetrics {
  hitRate: number;
  totalRequests: number;
  hits: number;
  misses: number;
}

export interface SystemMetrics {
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
}
