import express from "express";
import { validate } from "../shared/validation/index.js";
import { createFeedback } from "../controllers/feedback.controller.js";
import { createFeedbackSchema } from "../validators/feedback.validator.js";

const router = express.Router();

// Publik: siapa pun boleh mengirim saran (tanpa login).
router.post("/", validate("body", createFeedbackSchema), createFeedback);

export default router;
