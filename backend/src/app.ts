import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import healthRoutes from "./routes/health.routes.js";
import errorHandler from "./middleware/errorHandler.js";
import notFoundHandler from "./middleware/notFoundHandler.js";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
  }),
);
app.use(express.json());

// Routes
app.use("/api", healthRoutes);

// Fallback for not found endpoints
app.use(notFoundHandler);

// Global Error Handler must be last
app.use(errorHandler);

export default app;
