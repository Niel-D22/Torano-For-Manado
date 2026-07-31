import express from "express";
import { validate } from "../shared/validation/index.js";
import { requireAdminSession } from "../middleware/require-admin-session.js";
import { adminLogin, adminMe } from "../controllers/admin-auth.controller.js";
import {
  listApplications,
  getApplication,
  approveApplication,
  rejectApplication,
  updateReference,
} from "../controllers/admin.controller.js";
import {
  listUsers,
  getUserDetail,
  setUserStatus,
} from "../controllers/admin-users.controller.js";
import {
  listDisputes,
  getDispute,
  reviewDispute,
  resolveDispute,
} from "../controllers/disputes.controller.js";
import { resolveDisputeSchema } from "../validators/dispute.validator.js";
import {
  adminLoginSchema,
  rejectSchema,
  updateReferenceSchema,
} from "../validators/admin.validator.js";

const router = express.Router();

// Publik: login admin (username/password tetap).
router.post("/login", validate("body", adminLoginSchema), adminLogin);

// Selebihnya butuh token admin.
router.use(requireAdminSession);

router.get("/me", adminMe);
router.get("/worker-applications", listApplications);
router.get("/worker-applications/:id", getApplication);
router.patch("/worker-applications/:id/approve", approveApplication);
router.patch(
  "/worker-applications/:id/reject",
  validate("body", rejectSchema),
  rejectApplication,
);
router.patch(
  "/references/:id",
  validate("body", updateReferenceSchema),
  updateReference,
);

// Pengguna (pelanggan & mitra)
router.get("/users", listUsers);
router.get("/users/:id/detail", getUserDetail);
router.patch("/users/:profileId/status", setUserStatus);

// Sengketa
router.get("/disputes", listDisputes);
router.get("/disputes/:id", getDispute);
router.patch("/disputes/:id/review", reviewDispute);
router.patch(
  "/disputes/:id/resolve",
  validate("body", resolveDisputeSchema),
  resolveDispute,
);

export default router;
