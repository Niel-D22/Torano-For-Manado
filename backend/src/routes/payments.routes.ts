import express from "express";
import { validate } from "../shared/validation/index.js";
import { requireAuth } from "../middleware/require-auth.js";
import {
  sendOffer,
  respondOffer,
  createSnap,
  confirmPayment,
  releasePayment,
  webhook,
} from "../controllers/payments.controller.js";
import {
  offerSchema,
  offerResponseSchema,
} from "../validators/payment.validator.js";

const router = express.Router();

// Webhook Midtrans dipanggil server luar, tanpa token pengguna.
router.post("/webhook", webhook);

router.post("/offer", requireAuth, validate("body", offerSchema), sendOffer);
router.post(
  "/offer/:messageId/respond",
  requireAuth,
  validate("body", offerResponseSchema),
  respondOffer,
);
router.post("/:id/snap", requireAuth, createSnap);
router.post("/:id/confirm", requireAuth, confirmPayment);
router.post("/:id/release", requireAuth, releasePayment);

export default router;
