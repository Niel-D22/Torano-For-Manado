import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import * as schema from "./schema/index.js";
import { profiles } from "./schema/profiles.js";

// Jadikan sebuah akun (yang sudah registrasi & login minimal sekali) sebagai
// admin. Pakai: npm run db:make-admin -- email@contoh.com
async function main(): Promise<void> {
  const email = process.argv[2];
  if (!email) {
    console.error("Pakai: npm run db:make-admin -- <email>");
    process.exit(1);
  }

  const databaseUrl = process.env["DATABASE_URL"];
  if (!databaseUrl) {
    console.error("DATABASE_URL wajib diisi");
    process.exit(1);
  }

  const client = postgres(databaseUrl, { prepare: false });
  const db = drizzle(client, { schema });

  const [updated] = await db
    .update(profiles)
    .set({ role: "admin", updatedAt: new Date() })
    .where(eq(profiles.email, email))
    .returning();

  if (!updated) {
    console.error(
      `❌ Tidak ada profil dengan email "${email}". Pastikan akun sudah registrasi & login minimal sekali.`,
    );
  } else {
    console.log(`✅ "${email}" sekarang berperan admin.`);
  }

  await client.end();
}

main().catch((err) => {
  console.error("❌ Gagal:", err);
  process.exit(1);
});
