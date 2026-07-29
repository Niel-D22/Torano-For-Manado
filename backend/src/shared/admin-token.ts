import crypto from "node:crypto";
import { env } from "../config/env.js";

// Token admin ringan (HMAC-SHA256, tanpa dependency JWT). Cukup untuk panel
// admin dengan satu kredensial tetap — terpisah dari Supabase Auth.

export interface AdminClaims {
  name: string;
  exp: number;
}

const TWELVE_HOURS = 12 * 60 * 60 * 1000;

export function signAdminToken(name: string, ttlMs = TWELVE_HOURS): string {
  const body = Buffer.from(
    JSON.stringify({ name, exp: Date.now() + ttlMs }),
  ).toString("base64url");
  const sig = crypto
    .createHmac("sha256", env.ADMIN_SECRET)
    .update(body)
    .digest("base64url");
  return `${body}.${sig}`;
}

export function verifyAdminToken(token: string): AdminClaims | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expected = crypto
    .createHmac("sha256", env.ADMIN_SECRET)
    .update(body)
    .digest("base64url");

  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const claims = JSON.parse(
      Buffer.from(body, "base64url").toString(),
    ) as AdminClaims;
    if (typeof claims.exp !== "number" || claims.exp < Date.now()) return null;
    return claims;
  } catch {
    return null;
  }
}
