import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import { ValidationError } from "../errors/index.js";

type RequestLocation = "body" | "params" | "query";

/**
 * Creates an Express middleware that validates a specific part of the request
 * against a Zod schema. On success, the validated (and transformed) data
 * replaces the raw value on the request object, giving downstream handlers
 * typed access to it.
 *
 * Usage:
 *   router.post("/items", validate("body", createItemSchema), controller);
 */
export function validate<T>(
  location: RequestLocation,
  schema: ZodType<T>,
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[location]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));

      throw new ValidationError("Request data is invalid", details);
    }

    // Replace raw data with parsed & transformed output
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    (req as any)[location] = result.data;

    next();
  };
}
