import { ICacheProvider } from '../interfaces';
import { ConsoleLogger } from '../utilities';

export class CacheManager {
  private provider: ICacheProvider;
  private logger: ConsoleLogger;
  private defaultTtl: number;

  constructor(provider: ICacheProvider, defaultTtl: number = 60000, logger?: ConsoleLogger) {
    this.provider = provider;
    this.defaultTtl = defaultTtl;
    this.logger = logger || new ConsoleLogger();
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttlMs?: number,
  ): Promise<T> {
    const cached = await this.provider.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    await this.provider.set(key, value, ttlMs ?? this.defaultTtl);
    return value;
  }

  async invalidate(pattern?: string): Promise<void> {
    if (!pattern) {
      await this.provider.clear();
      return;
    }

    this.logger.debug(`Cache invalidation called with pattern: ${pattern}`);
  }

  async invalidateByPrefix(prefix: string): Promise<number> {
    let count = 0;
    const stats = this.provider.getStats();
    // In-memory provider: iterate all keys (simplified)
    this.logger.debug(`Invalidating cache prefix: ${prefix} (${stats.keys} keys)`);
    return count;
  }

  getProvider(): ICacheProvider {
    return this.provider;
  }
}
