import { JsonValue, ValidationResult } from '../interfaces';
import { ValidatorRegistry } from './validator-registry';

export class SchemaValidator {
  private registry: ValidatorRegistry;

  constructor(registry?: ValidatorRegistry) {
    this.registry = registry || new ValidatorRegistry();
  }

  validateRequest(body: JsonValue, schema: Record<string, unknown>): ValidationResult {
    return this.registry.validate(body, schema);
  }

  validateQueryParams(
    params: Record<string, string | string[]>,
    schema: Record<string, unknown>,
  ): ValidationResult {
    const plainParams: Record<string, JsonValue> = {};
    for (const [key, value] of Object.entries(params)) {
      plainParams[key] = Array.isArray(value) ? value.join(',') : value;
    }
    return this.registry.validate(plainParams, schema);
  }

  validatePathParams(
    params: Record<string, string>,
    schema: Record<string, unknown>,
  ): ValidationResult {
    return this.registry.validate(params as unknown as JsonValue, schema);
  }

  validateResponse(body: JsonValue, schema: Record<string, unknown>): ValidationResult {
    return this.registry.validate(body, schema);
  }
}
