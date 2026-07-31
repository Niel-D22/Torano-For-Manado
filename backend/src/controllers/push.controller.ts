import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../config/database.js";
import { pushSubscriptions } from "../db/schema/index.js";
import { sendSuccess } from "../shared/http/index.js";
import { env } from "../config/env.js";
import { ValidationError } from "../shared/errors/index.js";

// GET /api/push/key — kunci publik VAPID untuk berlangganan (publik).
export function getPushKey(_req: Request, res: Response): void {
  sendSuccess(res, { publicKey: env.VAPID_PUBLIC_KEY ?? null });
}

// POST /api/push/subscribe — simpan langganan push perangkat.
export async function subscribePush(req: Request, res: Response): Promise<void> {
  const me = req.profile!.id;
  const { subscription } = req.body as {
    subscription?: { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
  };
  const endpoint = subscription?.endpoint;
  const p256dh = subscription?.keys?.p256dh;
  const auth = subscription?.keys?.auth;
  if (!endpoint || !p256dh || !auth) {
    throw new ValidationError("Data langganan tidak lengkap");
  }

  await db
    .insert(pushSubscriptions)
    .values({ profileId: me, endpoint, p256dh, auth })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: { profileId: me, p256dh, auth },
    });

  sendSuccess(res, { ok: true }, { statusCode: 201 });
}

// POST /api/push/unsubscribe — hapus langganan perangkat.
export async function unsubscribePush(req: Request, res: Response): Promise<void> {
  const { endpoint } = req.body as { endpoint?: string };
  if (endpoint) {
    await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
  }
  sendSuccess(res, { ok: true });
}
