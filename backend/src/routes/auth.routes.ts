import express from "express";
import { validate } from "../shared/validation/index.js";
import { requireAuth, authenticate } from "../middleware/require-auth.js";
import { register, login, syncProfile, me } from "../controllers/auth.controller.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";

const router = express.Router();

router.post("/register", validate("body", registerSchema), register);
router.post("/login", validate("body", loginSchema), login);
router.post("/sync", authenticate, syncProfile);
router.get("/me", requireAuth, me);

export default router;
