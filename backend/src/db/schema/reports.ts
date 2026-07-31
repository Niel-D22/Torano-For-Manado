import { pgTable, uuid, varchar, text, timestamp, index } from "drizzle-orm/pg-core";
import { profiles } from "./profiles.js";

// Laporan / keluhan pengguna (pencari maupun pekerja) ke admin.
// status: open (Terbuka) -> resolved (Selesai)
export const reports = pgTable(
  "reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reporterProfileId: uuid("reporter_profile_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    reporterRole: varchar("reporter_role", { length: 20 }),
    reporterName: varchar("reporter_name", { length: 255 }),
    reporterEmail: varchar("reporter_email", { length: 255 }),
    category: varchar("category", { length: 60 }),
    subject: varchar("subject", { length: 200 }),
    message: text("message"),
    status: varchar("status", { length: 20 }).notNull().default("open"),
    adminReply: text("admin_reply"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (table) => [index("idx_reports_status").on(table.status)],
);
