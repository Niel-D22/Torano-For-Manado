import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema/index.js";
import { categories } from "./schema/categories.js";
import { sql } from "drizzle-orm";

// Selaras dengan kategori di frontend (art, tukang, event, montir).
const SEED_CATEGORIES = [
  {
    name: "ART & Bersih Rumah",
    slug: "art",
    description: "Asisten rumah tangga & layanan kebersihan rumah",
  },
  {
    name: "Tukang Harian",
    slug: "tukang",
    description: "Tukang bangunan, renovasi, dan perbaikan rumah",
  },
  {
    name: "Kru Acara & Adat",
    slug: "event",
    description: "Kru dan tenaga bantuan untuk acara dan adat",
  },
  {
    name: "Montir Panggilan",
    slug: "montir",
    description: "Montir panggilan untuk kendaraan dan mesin",
  },
];

async function seed(): Promise<void> {
  const databaseUrl = process.env["DATABASE_URL"];
  if (!databaseUrl) {
    console.error("DATABASE_URL is required to run the seed script");
    process.exit(1);
  }

  const client = postgres(databaseUrl, { prepare: false });
  const db = drizzle(client, { schema });

  console.log("🌱 Seeding categories…");

  for (const category of SEED_CATEGORIES) {
    await db
      .insert(categories)
      .values(category)
      .onConflictDoUpdate({
        target: categories.slug,
        set: {
          name: sql`excluded.name`,
          description: sql`excluded.description`,
          updatedAt: sql`now()`,
        },
      });

    console.log(`  ✓ ${category.name} (${category.slug})`);
  }

  console.log("✅ Seed completed");

  await client.end();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
