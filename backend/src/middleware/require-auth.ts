import type { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { supabase } from "../config/supabase.js";
import { db } from "../config/database.js";
import { profiles } from "../db/schema/index.js";
import { AuthenticationError } from "../shared/errors/index.js";

type Profile = typeof profiles.$inferSelect;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      authUser?: { id: string; email: string | null };
      profile?: Profile;
    }
  }
}

/**
 * Melindungi route: memverifikasi Bearer token (JWT Supabase) ke GoTrue,
 * lalu memuat profil pengguna dan menempelkannya ke `req` agar handler tahu
 * siapa pemanggilnya.
 */
export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
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

    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.authUserId, data.user.id),
    });
    if (!profile) {
      throw new AuthenticationError("Profil pengguna tidak ditemukan");
    }

    req.authUser = { id: data.user.id, email: data.user.email ?? null };
    req.profile = profile;
    next();
  } catch (err) {
    next(err);
  }
}
