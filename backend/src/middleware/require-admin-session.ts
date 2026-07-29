import type { Request, Response, NextFunction } from "express";
import { verifyAdminToken } from "../shared/admin-token.js";
import { AuthenticationError } from "../shared/errors/index.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: { name: string };
    }
  }
}

// Melindungi route admin: verifikasi token admin (HMAC) dari header Authorization.
export function requireAdminSession(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ")
    ? header.slice(7).trim()
    : undefined;

  const claims = token ? verifyAdminToken(token) : null;
  if (!claims) {
    return next(new AuthenticationError("Sesi admin tidak valid atau kedaluwarsa"));
  }

  req.admin = { name: claims.name };
  next();
}
