import express from "express";
import { requireAuth } from "../middleware/require-auth.js";
import { listNotifications } from "../controllers/notifications.controller.js";

const router = express.Router();

router.get("/", requireAuth, listNotifications);

export default router;
