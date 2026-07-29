import type { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { supabase } from "../config/supabase.js";
import { db } from "../config/database.js";
import { profiles } from "../db/schema/index.js";
import { AuthenticationError } from "../shared/errors/index.js";

type Profile = typeof profiles.$inferSelect;

interface AuthUser {
  id: string;
  email: string | null;
  fullName: string | null;
  role: string | null;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      authUser?: AuthUser;
      profile?: Profile;
    }
  }
}

// Verifikasi Bearer token (JWT Supabase) ke GoTrue dan tarik info pengguna.
// Menyertakan nama & peran dari user_metadata (diisi saat sign up email/Google).
async function verifyToken(req: Request): Promise<AuthUser> {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ")
    ? header.slice(7).trim()
    : undefined;

  if (!token) {
    throw new AuthenticationError("Token akses tidak ditemukan");
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    throw new AuthenticationError("Sesi tidak valid atau sudah kedaluwarsa");
  }

  const md = (data.user.user_metadata ?? {}) as Record<string, unknown>;
  const fullName =
    typeof md["full_name"] === "string"
      ? md["full_name"]
      : typeof md["name"] === "string"
        ? md["name"]
        : null;
  const role = typeof md["role"] === "string" ? md["role"] : null;

  return { id: data.user.id, email: data.user.email ?? null, fullName, role };
}

/**
 * Verifikasi token saja (tanpa mewajibkan profil). Dipakai endpoint sinkron
 * profil, karena user OAuth (Google) belum punya baris profil saat pertama login.
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    req.authUser = await verifyToken(req);
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Melindungi route: verifikasi token + wajib punya profil, lalu tempel ke `req`.
 */
export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    req.authUser = await verifyToken(req);

    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.authUserId, req.authUser.id),
    });
    if (!profile) {
      throw new AuthenticationError("Profil pengguna tidak ditemukan");
    }

    req.profile = profile;
    next();
  } catch (err) {
    next(err);
  }
}
