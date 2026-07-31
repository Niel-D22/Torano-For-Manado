import express from "express";
import { validate } from "../shared/validation/index.js";
import { requireAuth } from "../middleware/require-auth.js";
import { createDispute } from "../controllers/disputes.controller.js";
import { createDisputeSchema } from "../validators/dispute.validator.js";

const router = express.Router();

router.post("/", requireAuth, validate("body", createDisputeSchema), createDispute);

export default router;
