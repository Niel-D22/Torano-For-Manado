import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { workerApplications } from "./worker-applications.js";

export const workerReferences = pgTable(
  "worker_references",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workerApplicationId: uuid("worker_application_id")
      .notNull()
      .references(() => workerApplications.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    relationship: varchar("relationship", { length: 100 }).notNull(),
    phone: varchar("phone", { length: 30 }).notNull(),
    description: text("description"),
    // Hasil konfirmasi referensi oleh admin saat verifikasi mitra.
    contacted: boolean("contacted").notNull().default(false),
    adminNote: text("admin_note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_worker_references_application_id").on(
      table.workerApplicationId,
    ),
  ],
);
