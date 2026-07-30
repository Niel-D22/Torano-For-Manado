import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { workerApplications } from "./worker-applications.js";

// Rekening / e-wallet tujuan pencairan dana pekerja (mockup "Metode Pencairan").
export const payoutAccounts = pgTable(
  "payout_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workerApplicationId: uuid("worker_application_id")
      .notNull()
      .references(() => workerApplications.id, { onDelete: "cascade" }),
    // "bank" | "ewallet"
    type: varchar("type", { length: 20 }).notNull(),
    // Nama bank / penyedia e-wallet, mis. "BCA", "GoPay"
    provider: varchar("provider", { length: 100 }).notNull(),
    accountNumber: varchar("account_number", { length: 60 }).notNull(),
    accountHolder: varchar("account_holder", { length: 255 }).notNull(),
    isPrimary: boolean("is_primary").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_payout_accounts_application_id").on(table.workerApplicationId),
  ],
);
