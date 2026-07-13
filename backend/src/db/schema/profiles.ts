import {
  pgTable,
  pgEnum,
  uuid,
  text,
  varchar,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

/**
 * Role is a stable, finite set of values unlikely to change often,
 * so a PostgreSQL enum is appropriate here.
 */
export const userRoleEnum = pgEnum("user_role", [
  "customer",
  "worker",
  "admin",
]);

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    authUserId: uuid("auth_user_id").notNull().unique(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 30 }),
    avatarUrl: text("avatar_url"),
    role: userRoleEnum("role").notNull().default("customer"),
    accountStatus: varchar("account_status", { length: 30 })
      .notNull()
      .default("active"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_profiles_auth_user_id").on(table.authUserId),
    index("idx_profiles_email").on(table.email),
  ],
);
