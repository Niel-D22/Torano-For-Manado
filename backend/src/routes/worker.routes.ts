import express from "express";
import { validate } from "../shared/validation/index.js";
import { requireAuth } from "../middleware/require-auth.js";
import {
  getMe,
  getDashboard,
  getBookings,
  updateBookingStatus,
  getReviews,
  getEarnings,
  createWithdrawal,
  updateApplication,
  submitApplication,
  addReference,
  deleteReference,
  addPortfolio,
  deletePortfolio,
  addPayout,
  deletePayout,
} from "../controllers/worker.controller.js";
import {
  updateApplicationSchema,
  referenceSchema,
  portfolioSchema,
  payoutSchema,
  bookingStatusSchema,
  withdrawalSchema,
} from "../validators/worker.validator.js";

const router = express.Router();

// Semua route pekerja butuh login (token Supabase).
router.use(requireAuth);

router.get("/me", getMe);
router.get("/me/dashboard", getDashboard);
router.get("/me/bookings", getBookings);
router.patch(
  "/me/bookings/:id/status",
  validate("body", bookingStatusSchema),
  updateBookingStatus,
);
router.get("/me/reviews", getReviews);
router.get("/me/earnings", getEarnings);
router.post("/me/withdrawals", validate("body", withdrawalSchema), createWithdrawal);
router.patch(
  "/me/application",
  validate("body", updateApplicationSchema),
  updateApplication,
);
router.post("/me/application/submit", submitApplication);
router.post("/me/references", validate("body", referenceSchema), addReference);
router.delete("/me/references/:id", deleteReference);
router.post("/me/portfolios", validate("body", portfolioSchema), addPortfolio);
router.delete("/me/portfolios/:id", deletePortfolio);
router.post("/me/payout-accounts", validate("body", payoutSchema), addPayout);
router.delete("/me/payout-accounts/:id", deletePayout);

export default router;
