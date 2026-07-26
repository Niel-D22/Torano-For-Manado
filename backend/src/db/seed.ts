import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema/index.js";
import { categories } from "./schema/categories.js";
import { sql } from "drizzle-orm";

const SEED_CATEGORIES = [
  {
    name: "ART",
    slug: "art",
    description: "Asisten Rumah Tangga dan layanan kebersihan rumah",
  },
  {
    name: "Montir",
    slug: "montir",
    description: "Montir panggilan untuk kendaraan dan mesin",
  },
  {
    name: "Teknisi AC",
    slug: "teknisi-ac",
    description: "Pemasangan, perawatan, dan perbaikan AC",
  },
  {
    name: "Tim Acara",
    slug: "tim-acara",
    description: "Kru dan tenaga bantuan untuk acara dan kegiatan",
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
