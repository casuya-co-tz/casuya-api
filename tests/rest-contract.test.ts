import { describe, it, expect } from 'vitest';
import { RestContract, GraphQLContract, WebSocketContract } from '../src';

describe('RestContract', () => {
  it('should create with default values', () => {
    const contract = new RestContract('GET', '/health', {
      name: 'health-check',
      version: '1.0.0',
      description: 'Health check endpoint',
    });

    expect(contract.method).toBe('GET');
    expect(contract.path).toBe('/health');
    expect(contract.name).toBe('health-check');
    expect(contract.version).toBe('1.0.0');
    expect(contract.deprecated).toBe(false);
    expect(contract.parameters).toEqual([]);
    expect(contract.headers).toEqual([]);
    expect(contract.responses).toEqual([]);
  });

  it('should add parameters', () => {
    const contract = new RestContract('GET', '/users/:id', {
      name: 'get-user', version: '1.0.0', description: '',
    });

    contract.addParameter({
      name: 'id',
      in: 'path',
      required: true,
      type: 'string',
      description: 'User ID',
    });

    expect(contract.parameters.length).toBe(1);
    expect(contract.parameters[0].name).toBe('id');
  });

  it('should add headers', () => {
    const contract = new RestContract('GET', '/users', {
      name: 'list-users', version: '1.0.0', description: '',
    });

    contract.addHeader({
      name: 'Authorization',
      required: true,
      description: 'Bearer token',
    });

    expect(contract.headers.length).toBe(1);
  });

  it('should mark as deprecated', () => {
    const contract = new RestContract('GET', '/old', {
      name: 'old-endpoint', version: '1.0.0', description: '',
    });

    contract.markDeprecated();
    expect(contract.deprecated).toBe(true);
  });

  it('should add tags', () => {
    const contract = new RestContract('GET', '/users', {
      name: 'list-users', version: '1.0.0', description: '',
    });

    contract.addTag('users');
    contract.addTag('read');

    expect(contract.tags).toContain('users');
    expect(contract.tags).toContain('read');
  });

  it('should not add duplicate tags', () => {
    const contract = new RestContract('GET', '/users', {
      name: 'list-users', version: '1.0.0', description: '',
    });

    contract.addTag('users');
    contract.addTag('users');

    expect(contract.tags.length).toBe(1);
  });
});

describe('GraphQLContract', () => {
  it('should create with default values', () => {
    const contract = new GraphQLContract({
      name: 'user-schema',
      version: '1.0.0',
      description: 'User GraphQL schema',
    });

    expect(contract.name).toBe('user-schema');
    expect(contract.queries).toEqual([]);
    expect(contract.mutations).toEqual([]);
    expect(contract.subscriptions).toEqual([]);
  });

  it('should set typeDefs and resolvers', () => {
    const contract = new GraphQLContract({
      name: 'test', version: '1.0.0', description: '',
    });

    contract.setTypeDefs('type Query { hello: String }');
    contract.setResolvers({ Query: { hello: () => 'world' } });

    expect(contract.typeDefs).toBe('type Query { hello: String }');
    expect(contract.resolvers).toEqual({ Query: { hello: expect.any(Function) } });
  });

  it('should add queries and mutations', () => {
    const contract = new GraphQLContract({
      name: 'test', version: '1.0.0', description: '',
    });

    contract.addQuery('users');
    contract.addQuery('user');
    contract.addMutation('createUser');

    expect(contract.queries).toContain('users');
    expect(contract.mutations).toContain('createUser');
  });
});

describe('WebSocketContract', () => {
  it('should create with default values', () => {
    const contract = new WebSocketContract({
      name: 'chat', version: '1.0.0', description: 'Chat WebSocket',
    });

    expect(contract.name).toBe('chat');
    expect(contract.events).toEqual([]);
    expect(contract.channels).toEqual([]);
  });

  it('should add events and channels', () => {
    const contract = new WebSocketContract({
      name: 'chat', version: '1.0.0', description: '',
    });

    contract.addEvent({
      name: 'message',
      direction: 'bidirectional',
      payload: { type: 'object' },
      description: 'Chat message',
    });

    contract.addChannel('general');
    contract.addChannel('random');

    expect(contract.events.length).toBe(1);
    expect(contract.channels).toContain('general');
    expect(contract.channels).toContain('random');
  });

  it('should remove channels', () => {
    const contract = new WebSocketContract({
      name: 'chat', version: '1.0.0', description: '',
    });

    contract.addChannel('general');
    contract.removeChannel('general');

    expect(contract.channels).not.toContain('general');
  });
});
