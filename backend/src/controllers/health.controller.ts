import type { Request, Response } from "express";
import { checkDatabaseConnection } from "../config/database.js";

const healthCheck = (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: "ok",
    service: "application",
    message: "Backend is running",
    timestamp: new Date().toISOString(),
  });
};

const databaseHealthCheck = async (req: Request, res: Response) => {
  try {
    await checkDatabaseConnection();
    res.status(200).json({
      success: true,
      status: "ok",
      service: "database",
      message: "Database connection is healthy",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Log the error internally but don't leak details to the client
    console.error("Database health check failed:", error);
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
