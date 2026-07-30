import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { sendSuccess } from "../shared/http/index.js";
import { AuthenticationError } from "../shared/errors/index.js";
import { signAdminToken } from "../shared/admin-token.js";
import type { AdminLoginInput } from "../validators/admin.validator.js";

const ADMIN_NAME = "Admin Torano";

// POST /api/admin/login — cek username+password tetap, kembalikan token admin.
export function adminLogin(req: Request, res: Response): void {
  const { username, password } = req.body as AdminLoginInput;

  const ok = username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD;
  if (!ok) {
    throw new AuthenticationError("Username atau kata sandi admin salah");
  }

  const token = signAdminToken(ADMIN_NAME);
  sendSuccess(
    res,
    { token, admin: { name: ADMIN_NAME } },
    { message: "Login admin berhasil" },
  );
}

// GET /api/admin/me — info admin dari token (dilindungi requireAdminSession).
export function adminMe(req: Request, res: Response): void {
  sendSuccess(res, { admin: req.admin });
}
