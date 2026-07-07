import { describe, it, expect } from 'vitest';
import {
  generateRequestId,
  Stopwatch,
  measure,
  parseContentType,
  buildQueryString,
  UrlBuilder,
  parseVersion,
  compareVersions,
  satisfies,
} from '../src';

describe('generateRequestId', () => {
  it('should generate unique IDs', () => {
    const id1 = generateRequestId();
    const id2 = generateRequestId();
    expect(id1).not.toBe(id2);
  });

  it('should start with req_ prefix', () => {
    const id = generateRequestId();
    expect(id.startsWith('req_')).toBe(true);
  });
});

describe('Stopwatch', () => {
  it('should measure elapsed time', () => {
    const sw = new Stopwatch();
    expect(sw.elapsed).toBeGreaterThanOrEqual(0);
  });

  it('should return elapsed time on stop', () => {
    const sw = new Stopwatch();
    const elapsed = sw.stop();
    expect(elapsed).toBeGreaterThanOrEqual(0);
  });

  it('should reset', () => {
    const sw = new Stopwatch();
    sw.stop();
    sw.reset();
    expect(sw.elapsed).toBeGreaterThanOrEqual(0);
  });
});

describe('measure', () => {
  it('should return result and duration', () => {
    const { result, duration } = measure(() => 42);
    expect(result).toBe(42);
    expect(duration).toBeGreaterThanOrEqual(0);
  });
});

describe('parseContentType', () => {
  it('should strip charset', () => {
    const result = parseContentType('application/json; charset=utf-8');
    expect(result).toBe('application/json');
  });

  it('should handle simple content type', () => {
    const result = parseContentType('application/json');
    expect(result).toBe('application/json');
  });
});

describe('buildQueryString', () => {
  it('should build query string from params', () => {
    const result = buildQueryString({ page: 1, limit: 10 });
    expect(result).toBe('?page=1&limit=10');
  });

  it('should skip null and undefined values', () => {
    const result = buildQueryString({ a: 1, b: null, c: undefined });
    expect(result).toBe('?a=1');
  });

  it('should return empty string for empty params', () => {
    const result = buildQueryString({});
    expect(result).toBe('');
  });
});

describe('UrlBuilder', () => {
  it('should build URL from segments', () => {
    const url = new UrlBuilder()
      .segment('api')
      .version('1')
      .segment('users')
      .build();

    expect(url).toBe('api/v1/users');
  });

  it('should add params', () => {
    const url = UrlBuilder.api('1')
      .segment('users')
      .param('id', '123')
      .build();

    expect(url).toBe('v1/users/id/123');
  });
});

describe('parseVersion', () => {
  it('should parse full semver', () => {
    const result = parseVersion('1.2.3');
    expect(result).toEqual({ major: 1, minor: 2, patch: 3, label: undefined });
  });

  it('should parse without v prefix', () => {
    const result = parseVersion('v2.0.0');
    expect(result.major).toBe(2);
  });

  it('should parse with label', () => {
    const result = parseVersion('2.0.0-beta');
    expect(result.label).toBe('beta');
  });

  it('should handle partial versions', () => {
    const result = parseVersion('1');
    expect(result.major).toBe(1);
    expect(result.minor).toBe(0);
  });
});

describe('compareVersions', () => {
  it('should return positive when a > b', () => {
    expect(compareVersions('2.0.0', '1.0.0')).toBeGreaterThan(0);
  });

  it('should return negative when a < b', () => {
    expect(compareVersions('1.0.0', '2.0.0')).toBeLessThan(0);
  });

  it('should return zero when equal', () => {
    expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
  });
});

describe('satisfies', () => {
  it('should satisfy version range', () => {
    expect(satisfies('1.5.0', '1.0.0-2.0.0')).toBe(true);
  });

  it('should not satisfy when below range', () => {
    expect(satisfies('0.9.0', '1.0.0-2.0.0')).toBe(false);
  });

  it('should not satisfy when above range', () => {
    expect(satisfies('3.0.0', '1.0.0-2.0.0')).toBe(false);
  });
});
