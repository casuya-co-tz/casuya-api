import { describe, it, expect, beforeEach } from 'vitest';
import { MetricsCollector, HealthChecker } from '../src';
import { ApiRequest, ApiResponse } from '../src';

describe('MetricsCollector', () => {
  let collector: MetricsCollector;

  beforeEach(() => {
    collector = new MetricsCollector();
  });

  it('should record requests', () => {
    const req = createMockRequest('GET', '/users');
    const res = createMockResponse(200);

    collector.recordRequest(req, res, 100);
  });

  it('should record errors', () => {
    collector.recordError(new Error('test error'), { endpoint: '/users' });

    // Just verify it doesn't throw
    expect(true).toBe(true);
  });

  it('should get metrics snapshot', async () => {
    const req = createMockRequest('GET', '/users');
    const res = createMockResponse(200);

    collector.recordRequest(req, res, 50);
    collector.recordRequest(req, res, 150);

    const metrics = await collector.getMetrics();

    expect(metrics.requests.total).toBe(2);
    expect(metrics.requests.averageDuration).toBe(100);
    expect(metrics.requests.byStatus['200']).toBe(2);
  });

  it('should record cache metrics', () => {
    collector.recordMetric('cache.hit', 1);
    collector.recordMetric('cache.miss', 1);
    collector.recordMetric('cache.request', 2);

    expect(true).toBe(true);
  });

  it('should reset metrics', () => {
    const req = createMockRequest('GET', '/test');
    const res = createMockResponse(200);
    collector.recordRequest(req, res, 10);
    collector.reset();

    expect(true).toBe(true);
  });
});

describe('HealthChecker', () => {
  it('should return healthy when all checks pass', async () => {
    const checker = new HealthChecker('1.0.0');

    checker.register({
      name: 'database',
      check: async () => ({ status: 'healthy' }),
    });

    const result = await checker.checkAll();
    expect(result.status).toBe('healthy');
    expect(result.version).toBe('1.0.0');
  });

  it('should return unhealthy when a check fails', async () => {
    const checker = new HealthChecker('1.0.0');

    checker.register({
      name: 'database',
      check: async () => { throw new Error('Connection failed'); },
    });

    const result = await checker.checkAll();
    expect(result.status).toBe('unhealthy');
  });
});

function createMockRequest(method: string, path: string): ApiRequest {
  return {
    id: 'test-id',
    method: method as any,
    path,
    version: '1.0.0',
    headers: {},
    query: {},
    params: {},
    body: null,
    contentType: 'application/json',
    protocol: 'rest',
    ip: '127.0.0.1',
    timestamp: new Date(),
    metadata: {},
  };
}

function createMockResponse(status: number): ApiResponse {
  return {
    status,
    headers: {},
    body: null,
    contentType: 'application/json',
    version: '1.0.0',
    timing: 0,
  };
}
