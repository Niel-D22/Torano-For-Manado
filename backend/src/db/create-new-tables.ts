import { sql } from "drizzle-orm";
import { db, closeDatabase } from "../config/database.js";

// Membuat hanya tabel baru (reports, app_settings) tanpa menyentuh tabel lain.
async function main() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS app_settings (
      key varchar(60) PRIMARY KEY,
      value text,
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS reports (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      reporter_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
      reporter_role varchar(20),
      reporter_name varchar(255),
      reporter_email varchar(255),
      category varchar(60),
      subject varchar(200),
      message text,
      status varchar(20) NOT NULL DEFAULT 'open',
      admin_reply text,
      created_at timestamptz NOT NULL DEFAULT now(),
      resolved_at timestamptz
    );
  `);

  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);`);

  console.log("Tabel reports & app_settings siap.");
  await closeDatabase();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
