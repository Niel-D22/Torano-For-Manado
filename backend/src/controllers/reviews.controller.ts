import type { Request, Response } from "express";
import { and, eq, sql } from "drizzle-orm";
import { db } from "../config/database.js";
import {
  reviews,
  payments,
  workerApplications,
  messages,
} from "../db/schema/index.js";
import { sendSuccess } from "../shared/http/index.js";
import {
  NotFoundError,
  AuthorizationError,
  ValidationError,
} from "../shared/errors/index.js";

// POST /api/reviews — pelanggan menilai pekerja setelah dana dilepas.
export async function createReview(req: Request, res: Response): Promise<void> {
  const me = req.profile!;
  const { paymentId, rating, comment } = req.body as {
    paymentId: string;
    rating: number;
    comment?: string;
  };

  const [pay] = await db.select().from(payments).where(eq(payments.id, paymentId));
  if (!pay) throw new NotFoundError("Transaksi tidak ditemukan");
  if (pay.customerProfileId !== me.id) {
    throw new AuthorizationError("Hanya pelanggan yang bisa memberi ulasan");
  }
  if (pay.status !== "released") {
    throw new ValidationError("Ulasan bisa diberikan setelah pekerjaan selesai");
  }

  const existing = await db
    .select()
    .from(reviews)
    .where(eq(reviews.paymentId, paymentId));
  if (existing.length > 0) {
    throw new ValidationError("Transaksi ini sudah kamu ulas");
  }

  const app = await db.query.workerApplications.findFirst({
    where: eq(workerApplications.profileId, pay.workerProfileId),
  });
  if (!app) throw new NotFoundError("Pekerja tidak ditemukan");

  // Judul pekerjaan dari pesan permintaan di percakapan (bila ada).
  let jobTitle = app.serviceAreas?.[0] ? "Jasa di " + app.serviceAreas[0] : "Jasa Torano";
  if (pay.conversationId) {
    const sysMsgs = await db
      .select()
      .from(messages)
      .where(and(eq(messages.conversationId, pay.conversationId), eq(messages.type, "system")));
    for (const m of sysMsgs) {
      const p = (m.payload ?? {}) as Record<string, unknown>;
      if (p["kind"] === "request" && typeof p["jobTitle"] === "string") {
        jobTitle = p["jobTitle"] as string;
        break;
      }
    }
  }

  await db.insert(reviews).values({
    workerApplicationId: app.id,
    reviewerProfileId: me.id,
    paymentId,
    reviewerName: me.fullName ?? "Pelanggan",
    reviewerAvatar: me.avatarUrl ?? null,
    rating,
    comment: comment ?? null,
    jobTitle,
  });

  // Hitung ulang rata-rata & jumlah ulasan pekerja.
  const all = await db
    .select({ rating: reviews.rating })
    .from(reviews)
    .where(eq(reviews.workerApplicationId, app.id));
  const count = all.length;
  const avg = count > 0 ? all.reduce((s, r) => s + r.rating, 0) / count : 0;
  await db
    .update(workerApplications)
    .set({ ratingAvg: avg.toFixed(1), reviewCount: count })
    .where(eq(workerApplications.id, app.id));

  // Tandai kartu pembayaran di chat sudah diulas.
  if (pay.conversationId) {
    const cards = await db
      .select()
      .from(messages)
      .where(and(eq(messages.type, "payment"), sql`${messages.payload}->>'paymentId' = ${paymentId}`));
    for (const c of cards) {
      const pl = (c.payload ?? {}) as Record<string, unknown>;
      await db.update(messages).set({ payload: { ...pl, reviewed: true } }).where(eq(messages.id, c.id));
    }
  }

  sendSuccess(res, { ok: true, ratingAvg: avg.toFixed(1), reviewCount: count }, { statusCode: 201 });
}
