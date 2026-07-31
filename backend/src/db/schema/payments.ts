import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { conversations } from "./conversations.js";
import { bookings } from "./bookings.js";
import { profiles } from "./profiles.js";
import { workerApplications } from "./worker-applications.js";

// Pembayaran escrow. status: pending (tagihan dibuat) -> held (dana ditahan) ->
// released (dilepas ke pekerja) | refunded (dikembalikan ke pencari) | failed.
// amount dalam rupiah penuh (bukan ribuan).
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id").references(() => conversations.id, {
      onDelete: "set null",
    }),
    bookingId: uuid("booking_id").references(() => bookings.id, {
      onDelete: "set null",
    }),
    customerProfileId: uuid("customer_profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    workerProfileId: uuid("worker_profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    workerApplicationId: uuid("worker_application_id").references(
      () => workerApplications.id,
      { onDelete: "set null" },
    ),
    amount: numeric("amount", { precision: 12, scale: 0 }).notNull(),
    platformFee: numeric("platform_fee", { precision: 12, scale: 0 })
      .notNull()
      .default("0"),
    workerAmount: numeric("worker_amount", { precision: 12, scale: 0 })
      .notNull()
      .default("0"),
    method: varchar("method", { length: 30 }),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    orderId: varchar("order_id", { length: 60 }).unique(),
    gatewayRef: varchar("gateway_ref", { length: 100 }),
    snapToken: text("snap_token"),
    note: text("note"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    releasedAt: timestamp("released_at", { withTimezone: true }),
    refundedAt: timestamp("refunded_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_payments_conversation").on(table.conversationId)],
);
