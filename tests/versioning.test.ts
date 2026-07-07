import { describe, it, expect, beforeEach } from 'vitest';
import { VersionManager, VersionResolver, MigrationManager } from '../src';

describe('VersionManager', () => {
  let manager: VersionManager;

  beforeEach(() => {
    manager = new VersionManager();
  });

  it('should register versions', () => {
    manager.register('1.0.0');
    manager.register('2.0.0');

    expect(manager.getLatestVersion()).toBe('2.0.0');
  });

  it('should deprecate versions', () => {
    manager.register('1.0.0');
    manager.deprecate('1.0.0');

    expect(manager.isDeprecated('1.0.0')).toBe(true);
  });

  it('should return active versions only', () => {
    manager.register('1.0.0');
    manager.register('2.0.0');
    manager.deprecate('1.0.0');

    const active = manager.getActiveVersions();
    expect(active).toEqual(['2.0.0']);
  });

  it('should return default version when no versions registered', () => {
    expect(manager.getLatestVersion()).toBe('1.0.0');
  });
});

describe('VersionResolver', () => {
  let manager: VersionManager;
  let resolver: VersionResolver;

  beforeEach(() => {
    manager = new VersionManager();
    manager.register('1.0.0');
    manager.register('2.0.0');
    manager.setDefaultVersion('2.0.0');
    resolver = new VersionResolver(manager);
  });

  it('should resolve version from path prefix', () => {
    const result = resolver.resolve('/v1/users');
    expect(result.version).toBe('1');
    expect(result.originalPath).toBe('/users');
  });

  it('should use default version when no prefix', () => {
    const result = resolver.resolve('/users');
    expect(result.version).toBe('2.0.0');
  });

  it('should resolve version from header', () => {
    const version = resolver.resolveFromHeader({ 'accept-version': '1.0.0' });
    expect(version).toBe('1.0.0');
  });

  it('should return default version when header is invalid', () => {
    const version = resolver.resolveFromHeader({});
    expect(version).toBe('2.0.0');
  });
});

describe('MigrationManager', () => {
  let migrationManager: MigrationManager;

  beforeEach(() => {
    migrationManager = new MigrationManager();
  });

  it('should register and run migrations', () => {
    migrationManager.register({
      from: '1.0.0',
      to: '2.0.0',
      migrate: (data) => ({ ...data, migrated: true }),
      rollback: (data) => {
        const { migrated, ...rest } = data;
        return rest;
      },
    });

    const result = migrationManager.migrate({ name: 'test' }, '1.0.0', '2.0.0');
    expect(result).toEqual({ name: 'test', migrated: true });
  });

  it('should rollback data', () => {
    migrationManager.register({
      from: '1.0.0',
      to: '2.0.0',
      migrate: (data) => ({ ...data, migrated: true }),
      rollback: (data) => {
        const { migrated, ...rest } = data;
        return rest;
      },
    });

    const result = migrationManager.rollback({ name: 'test', migrated: true }, '1.0.0', '2.0.0');
    expect(result).toEqual({ name: 'test' });
  });
});
