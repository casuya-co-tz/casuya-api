import { IValidator, IValidatorRegistry, JsonValue, ValidationResult } from '../interfaces';
import { ZodValidator } from './zod-validator';

export class ValidatorRegistry implements IValidatorRegistry {
  private validators: Map<string, IValidator> = new Map();

  constructor() {
    this.register(new ZodValidator());
  }

  register(validator: IValidator): void {
    this.validators.set(validator.name, validator);
  }

  resolve(schemaType: string): IValidator {
    const validator = this.validators.get(schemaType);
    if (validator) return validator;
    throw new Error(`No validator registered for schema type '${schemaType}'`);
  }

  validate(data: JsonValue, schema: Record<string, unknown>): ValidationResult {
    for (const [, validator] of this.validators) {
      if (validator.supports(schema)) {
        return validator.validate(data, schema);
      }
    }
    return this.getDefault().validate(data, schema);
  }

  getDefault(): IValidator {
    const zod = this.validators.get('zod');
    if (!zod) throw new Error('No default validator registered');
    return zod;
  }

  getAll(): IValidator[] {
    return Array.from(this.validators.values());
  }
}
