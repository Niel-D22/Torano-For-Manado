import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { workerApplications } from "./worker-applications.js";

export const workerPortfolios = pgTable(
  "worker_portfolios",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workerApplicationId: uuid("worker_application_id")
      .notNull()
      .references(() => workerApplications.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    imageUrl: text("image_url").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_worker_portfolios_application_id").on(
      table.workerApplicationId,
    ),
  ],
);
