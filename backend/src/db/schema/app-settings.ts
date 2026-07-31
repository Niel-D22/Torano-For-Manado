import { pgTable, varchar, text, timestamp } from "drizzle-orm/pg-core";

// Pengaturan aplikasi key-value (mis. hash kata sandi admin).
export const appSettings = pgTable("app_settings", {
  key: varchar("key", { length: 60 }).primaryKey(),
  value: text("value"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
