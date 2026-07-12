import type { Request, Response, NextFunction } from "express";

type ErrorWithStatus = Error & {
  statusCode?: number;
};

const errorHandler = (err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

export default errorHandler;
