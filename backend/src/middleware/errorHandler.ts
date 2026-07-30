import type { Request, Response, NextFunction } from "express";
import { AppError } from "../shared/errors/index.js";
import { logger } from "../shared/logger/index.js";
import { env } from "../config/env.js";

// Zod v4
import { ZodError } from "zod";

interface ErrorResponseBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId: string;
}

function buildResponse(
  code: string,
  message: string,
  requestId: string,
  details?: unknown,
): ErrorResponseBody {
  const body: ErrorResponseBody = {
    success: false,
    error: { code, message },
    requestId,
  };

  if (details !== undefined) {
    body.error.details = details;
  }

  return body;
}

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const requestId = req.requestId ?? "unknown";
  const isProduction = env.NODE_ENV === "production";

  // 1. Known operational errors
  if (err instanceof AppError) {
    logger.error(
      {
        requestId,
        code: err.code,
        statusCode: err.statusCode,
        ...(err.isOperational ? {} : { stack: err.stack }),
      },
      err.message,
    );

    res
      .status(err.statusCode)
      .json(buildResponse(err.code, err.message, requestId, err.details));
    return;
  }

  // 2. Zod validation errors (thrown outside our validate middleware)
  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));

    logger.warn({ requestId, validationErrors: details }, "Validation failed");

    res
      .status(400)
      .json(
        buildResponse(
          "VALIDATION_ERROR",
          "Request data is invalid",
          requestId,
          details,
        ),
      );
    return;
  }

  // 3. Malformed JSON body (Express built-in parser)
  // Express sets a `type` property on SyntaxError for body-parser errors
  if (
    err instanceof SyntaxError &&
    "body" in err &&
    (err as Record<string, unknown>)["type"] === "entity.parse.failed"
  ) {
    logger.warn({ requestId }, "Malformed JSON in request body");

    res
      .status(400)
      .json(
        buildResponse(
          "VALIDATION_ERROR",
          "Malformed JSON in request body",
          requestId,
        ),
      );
    return;
  }

  // 4. Database errors (postgres.js sets severity, code, routine)
  if ("severity" in err && "code" in err && "routine" in err) {
    logger.error(
      {
        requestId,
        pgCode: (err as Record<string, unknown>)["code"],
        stack: err.stack,
      },
      "Database error",
    );

    res
      .status(500)
      .json(
        buildResponse(
          "DATABASE_ERROR",
          isProduction ? "A database error occurred" : err.message,
          requestId,
        ),
      );
    return;
  }

  // 5. Unknown / unexpected errors
  logger.error({ requestId, err, stack: err.stack }, "Unhandled error");

  res
    .status(500)
    .json(
      buildResponse(
        "INTERNAL_SERVER_ERROR",
        isProduction
          ? "An unexpected error occurred"
          : err.message || "An unexpected error occurred",
        requestId,
      ),
    );
};

export default errorHandler;
