import app from "./app.js";
import { env } from "./config/env.js";
import { checkDatabaseConnection, closeDatabase } from "./config/database.js";

async function bootstrap(): Promise<void> {
  try {
    console.log("🔌 Checking database connection...");
    await checkDatabaseConnection();
    console.log("✅ Database connection check passed");

    const server = app.listen(env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    });

    let isShuttingDown = false;

    const shutdown = async (signal: string): Promise<void> => {
      if (isShuttingDown) return;
      isShuttingDown = true;
      console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

      server.close(async (err) => {
        if (err) {
          console.error("❌ Error closing HTTP server:", err);
        } else {
          console.log("✅ HTTP server closed");
        }

        try {
          await closeDatabase();
          console.log("✅ Database connection closed");
          process.exit(err ? 1 : 0);
        } catch (dbErr) {
          console.error("❌ Error closing database connection:", dbErr);
          process.exit(1);
        }
      });

      // Fallback timeout
      setTimeout(() => {
        console.error("❌ Graceful shutdown timeout, forcing exit.");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

  } catch (error) {
    console.error("❌ Server startup failed:");
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

bootstrap();
