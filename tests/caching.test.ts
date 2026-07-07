import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryCache, CacheManager } from '../src';

describe('MemoryCache', () => {
  let cache: MemoryCache;

  beforeEach(async () => {
    cache = new MemoryCache(60000);
    await cache.clear();
  });

  it('should store and retrieve values', async () => {
    await cache.set('key1', 'value1');
    const result = await cache.get('key1');
    expect(result).toBe('value1');
  });

  it('should return undefined for missing keys', async () => {
    const result = await cache.get('nonexistent');
    expect(result).toBeUndefined();
  });

  it('should return true for existing keys', async () => {
    await cache.set('key1', 'value1');
    expect(await cache.has('key1')).toBe(true);
  });

  it('should delete keys', async () => {
    await cache.set('key1', 'value1');
    await cache.delete('key1');
    expect(await cache.get('key1')).toBeUndefined();
  });

  it('should clear all keys', async () => {
    await cache.set('a', 1);
    await cache.set('b', 2);
    await cache.clear();
    expect(await cache.get('a')).toBeUndefined();
    expect(await cache.get('b')).toBeUndefined();
  });

  it('should respect TTL', async () => {
    await cache.set('short', 'value', 1);
    await new Promise(r => setTimeout(r, 10));
    const result = await cache.get('short');
    expect(result).toBeUndefined();
  });

  it('should provide stats', async () => {
    await cache.get('miss');
    await cache.set('hit', 'value');
    await cache.get('hit');
    await cache.get('miss');

    const stats = cache.getStats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBeGreaterThanOrEqual(2);
  });
});

describe('CacheManager', () => {
  let provider: MemoryCache;
  let manager: CacheManager;

  beforeEach(async () => {
    provider = new MemoryCache(60000);
    manager = new CacheManager(provider);
    await provider.clear();
  });

  it('should get or set values', async () => {
    let calls = 0;
    const factory = async () => {
      calls++;
      return 'computed';
    };

    const result1 = await manager.getOrSet('key', factory);
    const result2 = await manager.getOrSet('key', factory);

    expect(result1).toBe('computed');
    expect(result2).toBe('computed');
    expect(calls).toBe(1);
  });
});
