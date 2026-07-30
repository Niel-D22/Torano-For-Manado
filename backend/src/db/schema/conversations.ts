import {
  pgTable,
  uuid,
  text,
  timestamp,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { profiles } from "./profiles.js";

// Percakapan antara pencari (customer) dan pekerja (worker).
export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerProfileId: uuid("customer_profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    workerProfileId: uuid("worker_profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    lastMessage: text("last_message"),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("uq_conversation_pair").on(
      table.customerProfileId,
      table.workerProfileId,
    ),
    index("idx_conversations_customer").on(table.customerProfileId),
    index("idx_conversations_worker").on(table.workerProfileId),
  ],
);
