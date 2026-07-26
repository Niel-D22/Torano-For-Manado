export type ErrorCode =
  | "VALIDATION_ERROR"
  | "AUTHENTICATION_REQUIRED"
  | "FORBIDDEN"
  | "RESOURCE_NOT_FOUND"
  | "ROUTE_NOT_FOUND"
  | "RESOURCE_CONFLICT"
  | "DATABASE_ERROR"
  | "INTERNAL_SERVER_ERROR";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details: unknown;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    code: ErrorCode,
    options?: {
      details?: unknown;
      isOperational?: boolean;
      cause?: Error;
    },
  ) {
    super(message, { cause: options?.cause });
    this.statusCode = statusCode;
    this.code = code;
    this.details = options?.details;
    this.isOperational = options?.isOperational ?? true;

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Request data is invalid", details?: unknown) {
    super(message, 400, "VALIDATION_ERROR", { details });
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication is required") {
    super(message, 401, "AUTHENTICATION_REQUIRED");
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "RESOURCE_NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409, "RESOURCE_CONFLICT");
  }
}

export class DatabaseError extends AppError {
  constructor(message = "A database error occurred", cause?: Error) {
    super(message, 500, "DATABASE_ERROR", {
      isOperational: false,
      cause,
    });
  }
}
