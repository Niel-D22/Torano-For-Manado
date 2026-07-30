import { z } from "zod";
import dotenv from "dotenv";

// Load .env file for runtime configuration
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(5000),

  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .startsWith("postgres", "DATABASE_URL must be a valid PostgreSQL URL"),

  SUPABASE_URL: z
    .string()
    .url("SUPABASE_URL must be a valid URL"),

  SUPABASE_ANON_KEY: z
    .string()
    .min(1, "SUPABASE_ANON_KEY is required"),

  CORS_ORIGIN: z
    .string()
    .url("CORS_ORIGIN must be a valid URL"),

  // Kredensial admin panel (login username/password terpisah dari Supabase).
  ADMIN_USERNAME: z.string().min(1).default("admin"),
  ADMIN_PASSWORD: z.string().min(1).default("torano-admin-2026"),
  ADMIN_SECRET: z
    .string()
    .min(1)
    .default("torano-dev-admin-secret-change-me"),

  // Email transaksional (opsional). Bila RESEND_API_KEY kosong, email dilewati
  // dengan aman dan hanya dicatat di log (in app notification tetap jalan).
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("Torano <onboarding@resend.dev>"),
  // URL frontend untuk tautan di dalam email.
  APP_URL: z.string().url().default("http://localhost:5173"),
});

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error("❌ Invalid environment variables:");
  parseResult.error.issues.forEach((issue) => {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  });
  process.exit(1);
}

export const env = parseResult.data;
