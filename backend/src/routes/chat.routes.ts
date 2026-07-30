import express from "express";
import { validate } from "../shared/validation/index.js";
import { requireAuth } from "../middleware/require-auth.js";
import {
  listConversations,
  getMessages,
  sendMessage,
  startConversation,
} from "../controllers/chat.controller.js";
import {
  messageSchema,
  startConversationSchema,
} from "../validators/chat.validator.js";

const router = express.Router();

router.use(requireAuth);

router.get("/conversations", listConversations);
router.post(
  "/conversations",
  validate("body", startConversationSchema),
  startConversation,
);
router.get("/conversations/:id/messages", getMessages);
router.post(
  "/conversations/:id/messages",
  validate("body", messageSchema),
  sendMessage,
);

export default router;
