import { v4 as uuidv4, validate as uuidValidate } from "uuid";
import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const headerValue = req.headers["x-request-id"];
  const incoming =
    typeof headerValue === "string" ? headerValue.trim() : undefined;

  const requestId =
    incoming && uuidValidate(incoming) ? incoming : uuidv4();

  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  next();
}
