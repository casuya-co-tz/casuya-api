import { describe, it, expect, beforeEach } from 'vitest';
import { ZodValidator, ValidatorRegistry, SchemaValidator } from '../src';

describe('ZodValidator', () => {
  let validator: ZodValidator;

  beforeEach(() => {
    validator = new ZodValidator();
  });

  it('should validate string schema', () => {
    const schema = { type: 'string' };
    const result = validator.validate('hello', schema);
    expect(result.valid).toBe(true);
  });

  it('should reject invalid number', () => {
    const schema = { type: 'number' };
    const result = validator.validate('not-a-number', schema);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should validate object schema', () => {
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
    };

    const result = validator.validate({ name: 'Alice', age: 30 }, schema);
    expect(result.valid).toBe(true);
  });

  it('should reject object with missing required fields', () => {
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
      },
      required: ['name'],
    };

    const result = validator.validate({ name: 'Alice' }, schema);
    expect(result.valid).toBe(true);
  });

  it('should validate array schema', () => {
    const schema = {
      type: 'array',
      items: { type: 'string' },
    };

    const result = validator.validate(['a', 'b', 'c'], schema);
    expect(result.valid).toBe(true);
  });

  it('should return validation errors with paths', () => {
    const schema = {
      type: 'object',
      properties: {
        age: { type: 'number' },
      },
    };

    const result = validator.validate({ age: 'not-a-number' }, schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0].path).toBe('age');
  });
});

describe('ValidatorRegistry', () => {
  let registry: ValidatorRegistry;

  beforeEach(() => {
    registry = new ValidatorRegistry();
  });

  it('should have Zod validator by default', () => {
    const validator = registry.getDefault();
    expect(validator.name).toBe('zod');
  });

  it('should validate using available validators', () => {
    const result = registry.validate('hello', { type: 'string' });
    expect(result.valid).toBe(true);
  });
});

describe('SchemaValidator', () => {
  let schemaValidator: SchemaValidator;

  beforeEach(() => {
    schemaValidator = new SchemaValidator();
  });

  it('should validate request body', () => {
    const result = schemaValidator.validateRequest(
      { name: 'test' },
      {
        type: 'object',
        properties: { name: { type: 'string' } },
      },
    );
    expect(result.valid).toBe(true);
  });

  it('should validate query params', () => {
    const result = schemaValidator.validateQueryParams(
      { page: '1' },
      {
        type: 'object',
        properties: { page: { type: 'string' } },
      },
    );
    expect(result.valid).toBe(true);
  });
});
