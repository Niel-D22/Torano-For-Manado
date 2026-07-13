import type { Request, Response } from "express";
import { checkDatabaseConnection } from "../config/database.js";
import { env } from "../config/env.js";
import { logger } from "../shared/logger/index.js";

const startedAt = Date.now();

const healthCheck = (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    status: "ok",
    service: "application",
    message: "Backend is running",
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startedAt) / 1000),
    environment: env.NODE_ENV,
  });
};

const databaseHealthCheck = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const TIMEOUT_MS = 5_000;

  try {
    await Promise.race([
      checkDatabaseConnection(),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Database health check timed out")),
          TIMEOUT_MS,
        ),
      ),
    ]);

    res.status(200).json({
      success: true,
      status: "ok",
      service: "database",
      message: "Database connection is healthy",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(
      { requestId: req.requestId, err: error },
      "Database health check failed",
    );

    res.status(503).json({
      success: false,
      status: "error",
      service: "database",
      message: "Database connection failed",
      timestamp: new Date().toISOString(),
    });
  }
};

export { healthCheck, databaseHealthCheck };
