import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { requestIdMiddleware } from "./middleware/request-id.js";
import { requestLogger } from "./middleware/request-logger.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
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

// --- Fallback for unmatched routes ---
app.use(notFoundHandler);

// --- Global error handler (must be last) ---
app.use(errorHandler);

export default app;
