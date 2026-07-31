import webpush from "web-push";
import { eq } from "drizzle-orm";
import { env } from "../../config/env.js";
import { db } from "../../config/database.js";
import { pushSubscriptions } from "../../db/schema/index.js";
import { logger } from "../logger/index.js";

let configured = false;
if (env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    env.VAPID_SUBJECT,
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY,
  );
  configured = true;
}

export const pushConfigured = () => configured;

interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

/**
 * Kirim Web Push ke semua perangkat milik satu profil. Non blocking dan aman:
 * bila VAPID belum diset, dilewati. Langganan mati (410/404) dihapus otomatis.
 */
export async function sendPushToProfile(
  profileId: string,
  payload: PushPayload,
): Promise<void> {
  if (!configured) return;
  const subs = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.profileId, profileId));
  if (subs.length === 0) return;

  const data = JSON.stringify(payload);
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          data,
        );
      } catch (err) {
        const code = (err as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) {
          await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, s.id));
        } else {
          logger.warn({ code }, "Gagal kirim push");
        }
      }
    }),
  );
}
