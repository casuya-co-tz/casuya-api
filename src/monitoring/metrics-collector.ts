import {
  IMonitor,
  ApiRequest,
  ApiResponse,
  Protocol,
  MetricsSnapshot,
  RequestMetrics,
  ErrorMetrics,
  CacheMetrics,
  SystemMetrics,
} from '../interfaces';

export class MetricsCollector implements IMonitor {
  readonly name = 'metrics-collector';

  private requestCount = 0;
  private requestDurations: number[] = [];
  private protocolCounts: Record<Protocol, number> = { rest: 0, graphql: 0, websocket: 0 };
  private statusCounts: Record<string, number> = {};
  private endpointCounts: Record<string, number> = {};
  private errorCount = 0;
  private errorTypes: Record<string, number> = {};
  private errorEndpoints: Record<string, number> = {};
  private cacheHits = 0;
  private cacheMisses = 0;
  private cacheRequests = 0;
  private startTime: number = Date.now();

  recordRequest(request: ApiRequest, response: ApiResponse, duration: number): void {
    this.requestCount++;
    this.requestDurations.push(duration);
    this.protocolCounts[request.protocol as Protocol] =
      (this.protocolCounts[request.protocol as Protocol] || 0) + 1;

    const statusKey = String(response.status);
    this.statusCounts[statusKey] = (this.statusCounts[statusKey] || 0) + 1;

    const endpointKey = `${request.method} ${request.path}`;
    this.endpointCounts[endpointKey] = (this.endpointCounts[endpointKey] || 0) + 1;
  }

  recordError(error: Error, context: Record<string, unknown>): void {
    this.errorCount++;
    this.errorTypes[error.name] = (this.errorTypes[error.name] || 0) + 1;

    const endpoint = context.endpoint as string;
    if (endpoint) {
      this.errorEndpoints[endpoint] = (this.errorEndpoints[endpoint] || 0) + 1;
    }
  }

  recordMetric(name: string, value: number, _tags?: Record<string, string>): void {
    if (name === 'cache.hit') this.cacheHits += value;
    if (name === 'cache.miss') this.cacheMisses += value;
    if (name === 'cache.request') this.cacheRequests += value;
  }

  async getMetrics(): Promise<MetricsSnapshot> {
    const sorted = [...this.requestDurations].sort((a, b) => a - b);
    const len = sorted.length;

    return {
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      requests: this.getRequestMetrics(sorted, len),
      errors: this.getErrorMetrics(),
      cache: this.getCacheMetrics(),
      system: this.getSystemMetrics(),
    };
  }

  private getRequestMetrics(sorted: number[], len: number): RequestMetrics {
    return {
      total: this.requestCount,
      byProtocol: { ...this.protocolCounts },
      byStatus: { ...this.statusCounts },
      byEndpoint: { ...this.endpointCounts },
      averageDuration: len > 0 ? sorted.reduce((a, b) => a + b, 0) / len : 0,
      p95Duration: len > 0 ? sorted[Math.floor(len * 0.95)] : 0,
      p99Duration: len > 0 ? sorted[Math.floor(len * 0.99)] : 0,
    };
  }

  private getErrorMetrics(): ErrorMetrics {
    return {
      total: this.errorCount,
      byType: { ...this.errorTypes },
      byEndpoint: { ...this.errorEndpoints },
    };
  }

  private getCacheMetrics(): CacheMetrics {
    const total = this.cacheHits + this.cacheMisses;
    return {
      hitRate: total > 0 ? this.cacheHits / total : 0,
      totalRequests: this.cacheRequests,
      hits: this.cacheHits,
      misses: this.cacheMisses,
    };
  }

  private getSystemMetrics(): SystemMetrics {
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;

    return {
      memoryUsage,
      cpuUsage: 0,
      activeConnections: 0,
    };
  }

  reset(): void {
    this.requestCount = 0;
    this.requestDurations = [];
    this.protocolCounts = { rest: 0, graphql: 0, websocket: 0 };
    this.statusCounts = {};
    this.endpointCounts = {};
    this.errorCount = 0;
    this.errorTypes = {};
    this.errorEndpoints = {};
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.cacheRequests = 0;
    this.startTime = Date.now();
  }
}
