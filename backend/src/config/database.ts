import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "./env.js";
import * as schema from "../db/schema/index.js";

const queryClient = postgres(env.DATABASE_URL, {
  prepare: false,
});

export const db = drizzle(queryClient, { schema });

export async function checkDatabaseConnection(): Promise<void> {
  await queryClient`SELECT 1`;
}

export async function closeDatabase(): Promise<void> {
  await queryClient.end();
}
