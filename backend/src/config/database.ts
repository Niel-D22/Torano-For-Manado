import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "./env.js";

const queryClient = postgres(env.DATABASE_URL, {
  prepare: false,
});

export const db = drizzle(queryClient);

export async function checkDatabaseConnection(): Promise<void> {
  try {
    // Jalankan SELECT 1 untuk health check
    await queryClient`SELECT 1`;
  } catch (error) {
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  await queryClient.end();
}
