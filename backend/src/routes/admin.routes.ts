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

export default router;
