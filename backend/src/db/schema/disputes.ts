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
import { payments } from "./payments.js";
import { profiles } from "./profiles.js";
import { workerApplications } from "./worker-applications.js";

// Sengketa antara pelanggan dan mitra atas sebuah transaksi escrow.
// status: open (Terbuka) -> reviewing (Ditinjau) -> resolved (Selesai)
// resolution: release | refund | split (diputuskan admin)
export const disputes = pgTable(
  "disputes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: varchar("code", { length: 30 }).unique(),
    paymentId: uuid("payment_id").references(() => payments.id, {
      onDelete: "set null",
    }),
    conversationId: uuid("conversation_id").references(() => conversations.id, {
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
    jobTitle: varchar("job_title", { length: 255 }),
    area: varchar("area", { length: 120 }),
    amount: numeric("amount", { precision: 12, scale: 0 }),
    reportedByProfileId: uuid("reported_by_profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    reportedByRole: varchar("reported_by_role", { length: 20 }).notNull(),
    reason: varchar("reason", { length: 120 }),
    description: text("description"),
    evidenceCustomer: text("evidence_customer").array(),
    evidenceWorker: text("evidence_worker").array(),
    status: varchar("status", { length: 20 }).notNull().default("open"),
    resolution: varchar("resolution", { length: 20 }),
    adminNote: text("admin_note"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_disputes_status").on(table.status)],
);
