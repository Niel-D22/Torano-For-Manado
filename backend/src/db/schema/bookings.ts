import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { workerApplications } from "./worker-applications.js";

// Pesanan/booking pekerjaan untuk pekerja (dipakai Beranda & Jadwal).
// status: new (permintaan masuk) -> accepted/scheduled -> completed | declined
export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workerApplicationId: uuid("worker_application_id")
      .notNull()
      .references(() => workerApplications.id, { onDelete: "cascade" }),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    customerAvatar: text("customer_avatar"),
    jobTitle: varchar("job_title", { length: 255 }).notNull(),
    area: varchar("area", { length: 120 }),
    // Tarif dalam ribuan rupiah.
    price: numeric("price", { precision: 12, scale: 0 }),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    status: varchar("status", { length: 30 }).notNull().default("new"),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_bookings_application_id").on(table.workerApplicationId),
    index("idx_bookings_status").on(table.status),
  ],
);
