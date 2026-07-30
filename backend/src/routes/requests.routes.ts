import express from "express";
import { validate } from "../shared/validation/index.js";
import { requireAuth } from "../middleware/require-auth.js";
import { createRequest } from "../controllers/requests.controller.js";
import { createRequestSchema } from "../validators/request.validator.js";

const router = express.Router();

router.post("/", requireAuth, validate("body", createRequestSchema), createRequest);

export default router;
