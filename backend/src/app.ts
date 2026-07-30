import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { requestIdMiddleware } from "./middleware/request-id.js";
import { requestLogger } from "./middleware/request-logger.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import workerRoutes from "./routes/worker.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import workersRoutes from "./routes/workers.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import errorHandler from "./middleware/errorHandler.js";
import notFoundHandler from "./middleware/notFoundHandler.js";

const app = express();

// --- Core middleware ---
app.use(requestIdMiddleware);
app.use(requestLogger);
app.use(
  cors({
    origin: env.CORS_ORIGIN,
  }),
);
app.use(express.json());

// --- Routes ---
app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/worker", workerRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/workers", workersRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationsRoutes);

// --- Fallback for unmatched routes ---
app.use(notFoundHandler);

// --- Global error handler (must be last) ---
app.use(errorHandler);

export default app;
