import { describe, it, expect, beforeEach } from 'vitest';
import { ContractRegistry, RestContract } from '../src';

describe('ContractRegistry', () => {
  let registry: ContractRegistry;

  beforeEach(() => {
    registry = new ContractRegistry();
  });

  it('should register and retrieve a contract', () => {
    const contract = new RestContract('GET', '/users', {
      name: 'list-users',
      version: '1.0.0',
      description: 'List all users',
    });

    registry.register(contract);
    const retrieved = registry.get('list-users', '1.0.0');

    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('list-users');
  });

  it('should throw when registering duplicate contract', () => {
    const contract = new RestContract('GET', '/users', {
      name: 'list-users',
      version: '1.0.0',
      description: 'List all users',
    });

    registry.register(contract);
    expect(() => registry.register(contract)).toThrow();
  });

  it('should return latest version when no version specified', () => {
    const v1 = new RestContract('GET', '/users', {
      name: 'list-users', version: '1.0.0', description: 'v1',
    });
    const v2 = new RestContract('GET', '/users', {
      name: 'list-users', version: '2.0.0', description: 'v2',
    });

    registry.register(v1);
    registry.register(v2);

    const latest = registry.get('list-users');
    expect(latest?.version).toBe('2.0.0');
  });

  it('should find contracts by path and method', () => {
    const contract = new RestContract('POST', '/users', {
      name: 'create-user', version: '1.0.0', description: 'Create user',
    });

    registry.register(contract);
    const found = registry.find('/users', 'POST');

    expect(found).toBeDefined();
    expect(found?.name).toBe('create-user');
  });

  it('should count contracts', () => {
    expect(registry.count()).toBe(0);

    registry.register(new RestContract('GET', '/a', {
      name: 'a', version: '1.0.0', description: '',
    }));
    registry.register(new RestContract('GET', '/b', {
      name: 'b', version: '1.0.0', description: '',
    }));

    expect(registry.count()).toBe(2);
  });

  it('should clear all contracts', () => {
    registry.register(new RestContract('GET', '/a', {
      name: 'a', version: '1.0.0', description: '',
    }));
    registry.clear();
    expect(registry.count()).toBe(0);
  });
});
