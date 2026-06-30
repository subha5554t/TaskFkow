export class ApiError extends Error {
  readonly statusCode: number;
  readonly errors?: unknown;

  constructor(statusCode: number, message: string, errors?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    // Preserves the correct stack trace in V8 environments
    Error.captureStackTrace(this, this.constructor);
  }
}
