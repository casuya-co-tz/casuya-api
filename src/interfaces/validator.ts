import { JsonValue } from './types';

export interface IValidator {
  readonly name: string;
  validate(data: JsonValue, schema: Record<string, unknown>): ValidationResult;
  supports(schema: Record<string, unknown>): boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationErrorItem[];
}

export interface ValidationErrorItem {
  path: string;
  message: string;
  code: string;
  value?: unknown;
}

export interface IValidatorRegistry {
  register(validator: IValidator): void;
  resolve(schemaType: string): IValidator;
  validate(data: JsonValue, schema: Record<string, unknown>): ValidationResult;
}
