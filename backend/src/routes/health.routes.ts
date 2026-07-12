import express from "express";
import { healthCheck, databaseHealthCheck } from "../controllers/health.controller.js";

const router = express.Router();

router.get("/health", healthCheck);
router.get("/health/database", databaseHealthCheck);

export default router;
