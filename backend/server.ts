import app from "./src/app.js";
import { env } from "./src/config/env.js";
import { checkDatabaseConnection, closeDatabase } from "./src/config/database.js";
import { logger } from "./src/shared/logger/index.js";

const SHUTDOWN_TIMEOUT_MS = 10_000;

async function bootstrap(): Promise<void> {
  try {
    logger.info("Checking database connection...");
    await checkDatabaseConnection();
    logger.info("Database connection check passed :D");

    const server = app.listen(env.PORT, () => {
      logger.info(`Server running on http://localhost:${env.PORT}`);
    });

    let isShuttingDown = false;

    const shutdown = async (reason: string, exitCode = 0): Promise<void> => {
      if (isShuttingDown) return;
      isShuttingDown = true;

      logger.info(`Received ${reason}. Starting graceful shutdown...`);

      const forceTimer = setTimeout(() => {
        logger.error("Graceful shutdown timed out, forcing exit");
        process.exit(1);
      }, SHUTDOWN_TIMEOUT_MS);
      forceTimer.unref();

      server.close(async () => {
        logger.info("HTTP server closed");

        try {
          await closeDatabase();
          logger.info("Database connection closed");
        } catch (dbErr) {
          logger.error({ err: dbErr }, "Error closing database connection");
          exitCode = 1;
        }

        process.exit(exitCode);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

    process.on("uncaughtException", (err) => {
      logger.fatal({ err }, "Uncaught exception");
      void shutdown("uncaughtException", 1);
    });

    process.on("unhandledRejection", (reason) => {
      logger.fatal({ err: reason }, "Unhandled promise rejection");
      void shutdown("unhandledRejection", 1);
    });
  } catch (error) {
    logger.fatal({ err: error }, "Server startup failed");
    process.exit(1);
  }
}

bootstrap();
