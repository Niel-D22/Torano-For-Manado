import type { Response } from "express";

interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

interface ListResponse<T> {
  success: true;
  data: T[];
  meta: Record<string, unknown>;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  options?: { message?: string; statusCode?: number },
): void {
  const body: SuccessResponse<T> = {
    success: true,
    data,
  };

  if (options?.message) {
    body.message = options.message;
  }

  res.status(options?.statusCode ?? 200).json(body);
}

export function sendList<T>(
  res: Response,
  data: T[],
  meta: Record<string, unknown> = {},
  options?: { statusCode?: number },
): void {
  const body: ListResponse<T> = {
    success: true,
    data,
    meta,
  };

  res.status(options?.statusCode ?? 200).json(body);
}
