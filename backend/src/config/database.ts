import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "./env.js";
import * as schema from "../db/schema/index.js";

// Session pooler Supabase dibatasi total 15 koneksi. Batasi pool aplikasi dan
// tutup koneksi idle agar tidak menghabiskan kuota (mis. saat beberapa proses).
const queryClient = postgres(env.DATABASE_URL, {
  prepare: false,
  max: 3,
  idle_timeout: 20,
});

export const db = drizzle(queryClient, { schema });

export async function checkDatabaseConnection(): Promise<void> {
  await queryClient`SELECT 1`;
}

export async function closeDatabase(): Promise<void> {
  await queryClient.end();
}
