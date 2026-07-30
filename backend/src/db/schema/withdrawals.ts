import {
  pgTable,
  uuid,
  numeric,
  varchar,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { workerApplications } from "./worker-applications.js";
import { payoutAccounts } from "./payout-accounts.js";

// Penarikan dana pekerja. amount dalam ribuan rupiah.
export const withdrawals = pgTable(
  "withdrawals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workerApplicationId: uuid("worker_application_id")
      .notNull()
      .references(() => workerApplications.id, { onDelete: "cascade" }),
    payoutAccountId: uuid("payout_account_id").references(
      () => payoutAccounts.id,
      { onDelete: "set null" },
    ),
    amount: numeric("amount", { precision: 12, scale: 0 }).notNull(),
    status: varchar("status", { length: 30 }).notNull().default("paid"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_withdrawals_application_id").on(table.workerApplicationId)],
);
