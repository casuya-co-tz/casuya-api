import { describe, it, expect, beforeEach } from 'vitest';
import { RateLimiter } from '../src';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter(60000, 5);
  });

  it('should create rate limiter middleware', () => {
    const middleware = limiter.middleware();
    expect(typeof middleware).toBe('function');
  });

  it('should track store size', () => {
    expect(limiter.getStoreSize()).toBe(0);
  });

  it('should cleanup expired entries', () => {
    const shortLimiter = new RateLimiter(1, 5);
    shortLimiter.middleware();
    // Force expire
    const cleanup = () => shortLimiter.cleanup();
    expect(cleanup).not.toThrow();
  });
});
