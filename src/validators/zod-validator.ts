import { z } from 'zod';
import { IValidator, ValidationResult, JsonValue } from '../interfaces';

export class ZodValidator implements IValidator {
  readonly name = 'zod';

  validate(data: JsonValue, schema: Record<string, unknown>): ValidationResult {
    try {
      const zodSchema = this.buildZodSchema(schema);
      const result = zodSchema.safeParse(data);

      if (result.success) {
        return { valid: true, errors: [] };
      }

      return {
        valid: false,
        errors: result.error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
          value: issue.path.reduce((obj: unknown, key) => {
            if (obj && typeof obj === 'object' && key in obj) {
              return (obj as Record<string, unknown>)[key];
            }
            return undefined;
          }, data as unknown),
        })),
      };
    } catch {
      return {
        valid: false,
        errors: [{ path: '', message: 'Invalid schema definition', code: 'invalid_schema' }],
      };
    }
  }

  supports(_schema: Record<string, unknown>): boolean {
    return true;
  }

  private buildZodSchema(schema: Record<string, unknown>): z.ZodType {
    return this.parseSchema(schema);
  }

  private parseSchema(schema: unknown): z.ZodType {
    if (typeof schema !== 'object' || schema === null) {
      return z.any();
    }

    const obj = schema as Record<string, unknown>;

    if (obj.type === 'string') {
      let s = z.string();
      if (obj.minLength) s = s.min(obj.minLength as number);
      if (obj.maxLength) s = s.max(obj.maxLength as number);
      if (obj.pattern) s = s.regex(new RegExp(obj.pattern as string));
      if (obj.enum) s = (z.enum(obj.enum as [string, ...string[]])) as unknown as z.ZodString;
      return s;
    }

    if (obj.type === 'number') {
      let n = z.number();
      if (obj.minimum !== undefined) n = n.min(obj.minimum as number);
      if (obj.maximum !== undefined) n = n.max(obj.maximum as number);
      return n;
    }

    if (obj.type === 'integer') {
      return z.number().int();
    }

    if (obj.type === 'boolean') {
      return z.boolean();
    }

    if (obj.type === 'array') {
      return z.array(this.parseSchema(obj.items));
    }

    if (obj.type === 'object' && obj.properties) {
      const shape: Record<string, z.ZodType> = {};
      const props = obj.properties as Record<string, unknown>;
      for (const [key, propSchema] of Object.entries(props)) {
        shape[key] = this.parseSchema(propSchema);
      }
      const zodObj = z.object(shape);

      if (obj.required === false) {
        return zodObj.partial();
      }
      if (Array.isArray(obj.required)) {
        const requiredFields = obj.required as string[];
        const optionalFields = Object.keys(shape).filter(k => !requiredFields.includes(k));
        if (optionalFields.length > 0) {
          const partialKeys: Record<string, true> = {};
          for (const k of optionalFields) { partialKeys[k] = true; }
          return zodObj.partial(partialKeys);
        }
      }
      return zodObj;
    }

    return z.any();
  }
}
