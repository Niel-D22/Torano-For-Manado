import express from "express";
import { validate } from "../shared/validation/index.js";
import { requireAuth } from "../middleware/require-auth.js";
import { createReview } from "../controllers/reviews.controller.js";
import { createReviewSchema } from "../validators/review.validator.js";

const router = express.Router();

router.post("/", requireAuth, validate("body", createReviewSchema), createReview);

export default router;
