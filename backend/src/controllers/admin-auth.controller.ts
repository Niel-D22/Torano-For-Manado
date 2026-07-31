import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { env } from "../config/env.js";
import { db } from "../config/database.js";
import { appSettings } from "../db/schema/index.js";
import { sendSuccess } from "../shared/http/index.js";
import { AuthenticationError, ValidationError } from "../shared/errors/index.js";
import { signAdminToken } from "../shared/admin-token.js";
import { hashPassword, verifyPassword } from "../shared/password/index.js";
import type { AdminLoginInput } from "../validators/admin.validator.js";

const ADMIN_NAME = "Admin Torano";
const PW_KEY = "admin_password_hash";

async function storedHash(): Promise<string | null> {
  const [row] = await db.select().from(appSettings).where(eq(appSettings.key, PW_KEY));
  return row?.value ?? null;
}

// Cek kata sandi: pakai hash tersimpan bila ada, jika belum pakai nilai .env.
async function checkPassword(password: string): Promise<boolean> {
  const hash = await storedHash();
  if (hash) return verifyPassword(password, hash);
  return password === env.ADMIN_PASSWORD;
}

// POST /api/admin/login
export async function adminLogin(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body as AdminLoginInput;
  const ok = username === env.ADMIN_USERNAME && (await checkPassword(password));
  if (!ok) throw new AuthenticationError("Username atau kata sandi admin salah");

  const token = signAdminToken(ADMIN_NAME);
  sendSuccess(res, { token, admin: { name: ADMIN_NAME } }, { message: "Login admin berhasil" });
}

// GET /api/admin/me
export function adminMe(req: Request, res: Response): void {
  sendSuccess(res, { admin: req.admin });
}

// PATCH /api/admin/password — ubah kata sandi admin (disimpan di database).
export async function changeAdminPassword(req: Request, res: Response): Promise<void> {
  const { currentPassword, newPassword } = req.body as {
    currentPassword: string;
    newPassword: string;
  };
  if (!(await checkPassword(currentPassword))) {
    throw new AuthenticationError("Kata sandi saat ini salah");
  }
  if (!newPassword || newPassword.length < 8) {
    throw new ValidationError("Kata sandi baru minimal 8 karakter");
  }
  const value = hashPassword(newPassword);
  await db
    .insert(appSettings)
    .values({ key: PW_KEY, value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: appSettings.key, set: { value, updatedAt: new Date() } });

  sendSuccess(res, { ok: true }, { message: "Kata sandi admin diperbarui" });
}
