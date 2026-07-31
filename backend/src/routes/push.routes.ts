import express from "express";
import { requireAuth } from "../middleware/require-auth.js";
import {
  getPushKey,
  subscribePush,
  unsubscribePush,
} from "../controllers/push.controller.js";

const router = express.Router();

router.get("/key", getPushKey);
router.post("/subscribe", requireAuth, subscribePush);
router.post("/unsubscribe", requireAuth, unsubscribePush);

export default router;
