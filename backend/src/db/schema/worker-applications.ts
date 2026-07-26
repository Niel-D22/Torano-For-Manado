import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  timestamp,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { profiles } from "./profiles.js";
import { categories } from "./categories.js";

/**
 * Worker application status uses varchar + application-level validation
 * rather than a PostgreSQL enum. The workflow statuses are not yet finalized
 * and ALTER TYPE ... ADD VALUE requires careful migration handling.
 * This makes it easy to add new statuses without a schema migration.
 */
export const workerApplications = pgTable(
  "worker_applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    nik: varchar("nik", { length: 20 }).notNull(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    skillDescription: text("skill_description").notNull(),
    /**
     * Fixed rate in IDR stored as numeric(12,0) — safe for Rupiah amounts up to
     * 999 billion without floating-point rounding issues.
     */
    fixedRate: numeric("fixed_rate", { precision: 12, scale: 0 }).notNull(),
    /**
     * Coordinates use numeric(9,6) for ~11cm precision at the equator,
     * which is more than sufficient for service area matching.
     */
    latitude: numeric("latitude", { precision: 9, scale: 6 }),
    longitude: numeric("longitude", { precision: 10, scale: 6 }),
    profilePhotoUrl: text("profile_photo_url"),
    selfiePhotoUrl: text("selfie_photo_url"),
    status: varchar("status", { length: 30 }).notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_worker_applications_profile_id").on(table.profileId),
    index("idx_worker_applications_category_id").on(table.categoryId),
    index("idx_worker_applications_status").on(table.status),
    check(
      "chk_latitude",
      sql`${table.latitude} IS NULL OR (${table.latitude} >= -90 AND ${table.latitude} <= 90)`,
    ),
    check(
      "chk_longitude",
      sql`${table.longitude} IS NULL OR (${table.longitude} >= -180 AND ${table.longitude} <= 180)`,
    ),
  ],
);
