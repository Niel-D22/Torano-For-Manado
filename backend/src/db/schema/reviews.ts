import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { workerApplications } from "./worker-applications.js";

// Ulasan pelanggan untuk pekerja.
export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workerApplicationId: uuid("worker_application_id")
      .notNull()
      .references(() => workerApplications.id, { onDelete: "cascade" }),
    reviewerName: varchar("reviewer_name", { length: 255 }).notNull(),
    reviewerAvatar: text("reviewer_avatar"),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    photos: text("photos").array(),
    jobTitle: varchar("job_title", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_reviews_application_id").on(table.workerApplicationId),
    check("chk_review_rating", sql`${table.rating} >= 1 AND ${table.rating} <= 5`),
  ],
);
