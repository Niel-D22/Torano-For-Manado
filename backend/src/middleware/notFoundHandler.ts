import type { Request, Response, NextFunction } from "express";

const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  res.status(404).json({
    success: false,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
    requestId: req.requestId ?? "unknown",
  });
};

export default notFoundHandler;
