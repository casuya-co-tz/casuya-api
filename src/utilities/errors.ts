import { ErrorCode, JsonValue } from '../interfaces';

export class ApiError extends Error {
  public readonly code: ErrorCode;
  public readonly details?: JsonValue;
  public readonly statusCode: number;

  constructor(code: ErrorCode, message: string, statusCode: number = 500, details?: JsonValue) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.statusCode = statusCode;
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: JsonValue) {
    super('VALIDATION_ERROR', message, 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id '${id}' not found` : `${resource} not found`;
    super('NOT_FOUND', message, 404);
    this.name = 'NotFoundError';
  }
}

export class RateLimitedError extends ApiError {
  public readonly retryAfter: number;

  constructor(retryAfter: number = 60) {
    super('RATE_LIMITED', 'Too many requests. Please try again later.', 429);
    this.name = 'RateLimitedError';
    this.retryAfter = retryAfter;
  }
}

export class ContractViolationError extends ApiError {
  constructor(message: string, details?: JsonValue) {
    super('CONTRACT_VIOLATION', message, 400, details);
    this.name = 'ContractViolationError';
  }
}

export class VersionMismatchError extends ApiError {
  constructor(expected: string, received: string) {
    super(
      'VERSION_MISMATCH',
      `API version mismatch. Expected '${expected}', received '${received}'.`,
      400,
    );
    this.name = 'VersionMismatchError';
  }
}

export class SerializationError extends ApiError {
  constructor(message: string, details?: JsonValue) {
    super('SERIALIZATION_ERROR', message, 500, details);
    this.name = 'SerializationError';
  }
}
