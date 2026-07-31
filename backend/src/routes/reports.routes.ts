import express from "express";
import { validate } from "../shared/validation/index.js";
import { requireAuth } from "../middleware/require-auth.js";
import { createReport, listMyReports } from "../controllers/reports.controller.js";
import { createReportSchema } from "../validators/report.validator.js";

const router = express.Router();

router.post("/", requireAuth, validate("body", createReportSchema), createReport);
router.get("/me", requireAuth, listMyReports);

export default router;
