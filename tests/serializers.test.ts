import { describe, it, expect, beforeEach } from 'vitest';
import { JsonSerializer, SerializerRegistry } from '../src';

describe('JsonSerializer', () => {
  let serializer: JsonSerializer;

  beforeEach(() => {
    serializer = new JsonSerializer();
  });

  it('should serialize data to JSON string', () => {
    const data = { name: 'test', value: 42 };
    const result = serializer.serialize(data);
    expect(result).toBe('{"name":"test","value":42}');
  });

  it('should deserialize JSON string to data', () => {
    const data = '{"name":"test","value":42}';
    const result = serializer.deserialize(data);
    expect(result).toEqual({ name: 'test', value: 42 });
  });

  it('should support application/json content type', () => {
    expect(serializer.supports('application/json')).toBe(true);
    expect(serializer.supports('text/plain')).toBe(false);
  });

  it('should deserialize Buffer data', () => {
    const buffer = Buffer.from('{"key":"value"}');
    const result = serializer.deserialize(buffer);
    expect(result).toEqual({ key: 'value' });
  });
});

describe('SerializerRegistry', () => {
  let registry: SerializerRegistry;

  beforeEach(() => {
    registry = new SerializerRegistry();
  });

  it('should have JSON serializer by default', () => {
    const serializer = registry.getDefault();
    expect(serializer.contentType).toBe('application/json');
  });

  it('should resolve correct serializer for content type', () => {
    const serializer = registry.resolve('application/json');
    expect(serializer).toBeDefined();
    expect(serializer.contentType).toBe('application/json');
  });

  it('should return all registered serializers', () => {
    const serializers = registry.getAll();
    expect(serializers.length).toBe(1);
  });
});
