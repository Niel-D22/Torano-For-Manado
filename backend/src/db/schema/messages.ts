import {
  pgTable,
  uuid,
  varchar,
  text,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { conversations } from "./conversations.js";
import { profiles } from "./profiles.js";

// Pesan dalam percakapan. type: text | location | offer | payment | system.
// payload jsonb menyimpan data lokasi {lat,lng,address}, tawaran {amount,status},
// atau pembayaran, sesuai type.
export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderProfileId: uuid("sender_profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 20 }).notNull().default("text"),
    body: text("body"),
    payload: jsonb("payload"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_messages_conversation").on(table.conversationId)],
);
