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

  // Satu atau beberapa origin yang diizinkan, dipisah koma.
  // Contoh: "http://localhost:5173,https://torano.netlify.app"
  CORS_ORIGIN: z.string().min(1).default("http://localhost:5173"),

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
  // Tujuan kotak saran (tidak ditampilkan di frontend).
  FEEDBACK_TO: z.string().default("danielwarouw01@gmail.com"),
  // URL frontend untuk tautan di dalam email.
  APP_URL: z.string().url().default("http://localhost:5173"),

  // Midtrans (payment gateway). Sandbox untuk lomba: kunci diawali "SB-Mid-".
  MIDTRANS_SERVER_KEY: z.string().optional(),
  MIDTRANS_CLIENT_KEY: z.string().optional(),
  MIDTRANS_IS_PRODUCTION: z
    .string()
    .default("false")
    .transform((v) => v === "true"),
  // Komisi platform dalam persen (dipotong saat dana dilepas ke pekerja).
  PLATFORM_FEE_PCT: z.coerce.number().min(0).max(50).default(12),

  // Web Push (PWA). Opsional: bila kosong, push dilewati dengan aman.
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().default("mailto:admin@torano.app"),
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
