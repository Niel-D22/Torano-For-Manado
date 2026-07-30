import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { supabase } from "../config/supabase.js";
import { db } from "../config/database.js";
import { profiles } from "../db/schema/index.js";
import { sendSuccess } from "../shared/http/index.js";
import {
  AppError,
  AuthenticationError,
  ConflictError,
} from "../shared/errors/index.js";
import type {
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
} from "../validators/auth.validator.js";

type Profile = typeof profiles.$inferSelect;

/**
 * POST /api/auth/register
 * Buat akun di Supabase Auth, lalu buat baris profil yang tertaut.
 */
export async function register(req: Request, res: Response): Promise<void> {
  const { email, password, fullName, phone, role } = req.body as RegisterInput;

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    if (/already registered|already exists/i.test(error.message)) {
      throw new ConflictError("Email sudah terdaftar");
    }
    throw new AppError(error.message, error.status ?? 400, "VALIDATION_ERROR");
  }

  const authUser = data.user;
  if (!authUser) {
    throw new AppError("Gagal membuat akun", 500, "INTERNAL_SERVER_ERROR");
  }

  // Idempoten: kalau profil untuk auth user ini sudah ada, perbarui datanya.
  const [profile] = await db
    .insert(profiles)
    .values({
      authUserId: authUser.id,
      fullName,
      email,
      phone: phone ?? null,
      role: role ?? "customer",
    })
    .onConflictDoUpdate({
      target: profiles.authUserId,
      set: { fullName, phone: phone ?? null, updatedAt: new Date() },
    })
    .returning();

  if (!profile) {
    throw new AppError("Gagal menyimpan profil", 500, "DATABASE_ERROR");
  }

  sendSuccess(
    res,
    { session: data.session, profile },
    {
      statusCode: 201,
      message: data.session
        ? "Registrasi berhasil"
        : "Registrasi berhasil. Silakan verifikasi email untuk mengaktifkan akun.",
    },
  );
}

/**
 * POST /api/auth/login
 * Autentikasi email + kata sandi via Supabase, kembalikan sesi + profil.
 */
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as LoginInput;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.session) {
    throw new AuthenticationError("Email atau kata sandi salah");
  }

  // Jaring pengaman: pastikan profil ada (mis. akun dibuat di luar endpoint ini).
  let profile: Profile | undefined = await db.query.profiles.findFirst({
    where: eq(profiles.authUserId, data.user.id),
  });
  if (!profile) {
    [profile] = await db
      .insert(profiles)
      .values({
        authUserId: data.user.id,
        fullName: data.user.email ?? "Pengguna",
        email: data.user.email ?? null,
      })
      .onConflictDoNothing()
      .returning();
    profile ??= await db.query.profiles.findFirst({
      where: eq(profiles.authUserId, data.user.id),
    });
  }

  sendSuccess(
    res,
    { session: data.session, profile },
    { message: "Login berhasil" },
  );
}

/**
 * POST /api/auth/sync — dipanggil frontend setelah login (email/Google).
 * Membuat baris profil bila belum ada (kasus login Google pertama kali),
 * lalu mengembalikan profilnya. Idempoten.
 */
export async function syncProfile(req: Request, res: Response): Promise<void> {
  const authUser = req.authUser;
  if (!authUser) {
    throw new AuthenticationError("Sesi tidak valid");
  }

  await db
    .insert(profiles)
    .values({
      authUserId: authUser.id,
      fullName: authUser.fullName ?? authUser.email ?? "Pengguna",
      email: authUser.email,
      role: authUser.role === "worker" ? "worker" : "customer",
    })
    .onConflictDoNothing();

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.authUserId, authUser.id),
  });

  sendSuccess(res, { profile });
}

/**
 * GET /api/auth/me — profil pengguna yang sedang login (dilindungi requireAuth).
 */
export async function me(req: Request, res: Response): Promise<void> {
  sendSuccess(res, { profile: req.profile });
}

/**
 * PATCH /api/auth/profile — ubah profil sendiri (nama, telepon, foto).
 * Dipakai pencari maupun pekerja untuk mengedit identitasnya.
 */
export async function updateProfile(req: Request, res: Response): Promise<void> {
  const profile = req.profile;
  if (!profile) {
    throw new AuthenticationError("Sesi tidak valid");
  }
  const { fullName, phone, avatarUrl } = req.body as UpdateProfileInput;

  const set: Partial<typeof profiles.$inferInsert> = { updatedAt: new Date() };
  if (fullName !== undefined) set.fullName = fullName;
  if (phone !== undefined) set.phone = phone || null;
  if (avatarUrl !== undefined) set.avatarUrl = avatarUrl || null;

  const [updated] = await db
    .update(profiles)
    .set(set)
    .where(eq(profiles.id, profile.id))
    .returning();

  sendSuccess(res, { profile: updated }, { message: "Profil diperbarui" });
}
