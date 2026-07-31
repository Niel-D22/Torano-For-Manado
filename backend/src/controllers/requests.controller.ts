import type { Request, Response } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "../config/database.js";
import {
  conversations,
  messages,
  bookings,
  workerApplications,
} from "../db/schema/index.js";
import { sendSuccess } from "../shared/http/index.js";
import {
  AuthenticationError,
  NotFoundError,
  ValidationError,
} from "../shared/errors/index.js";
import { sendEmail, emailShell } from "../shared/email/index.js";
import { sendPushToProfile } from "../shared/push/index.js";
import { env } from "../config/env.js";
import type { CreateRequestInput } from "../validators/request.validator.js";

const fmtWaktu = (iso?: string | null): string => {
  if (!iso) return "Fleksibel (dibahas di chat)";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Fleksibel (dibahas di chat)";
  return d.toLocaleString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * POST /api/requests — pencari mengajukan permintaan ke pekerja.
 * Membuka percakapan, mencatat booking (status "new" = permintaan masuk),
 * menaruh ringkasan permintaan sebagai pesan sistem di chat, lalu memberi tahu
 * pekerja lewat email dan lonceng notifikasi.
 */
export async function createRequest(
  req: Request,
  res: Response,
): Promise<void> {
  const me = req.profile;
  if (!me) throw new AuthenticationError("Sesi tidak valid");

  const { workerProfileId, jobTitle, area, preferredAt, note } =
    req.body as CreateRequestInput;

  if (workerProfileId === me.id) {
    throw new ValidationError("Tidak bisa mengajukan permintaan ke diri sendiri");
  }

  // Pekerja harus terverifikasi.
  const app = await db.query.workerApplications.findFirst({
    where: eq(workerApplications.profileId, workerProfileId),
    with: { profile: true },
  });
  if (!app || app.status !== "verified" || !app.profile) {
    throw new NotFoundError("Pekerja tidak ditemukan atau belum terverifikasi");
  }
  if (app.isOnline === false) {
    throw new ValidationError(
      "Pekerja sedang libur dan tidak menerima permintaan saat ini",
    );
  }

  // Buka atau ambil percakapan yang sudah ada.
  await db
    .insert(conversations)
    .values({ customerProfileId: me.id, workerProfileId })
    .onConflictDoNothing();
  const convo = await db.query.conversations.findFirst({
    where: and(
      eq(conversations.customerProfileId, me.id),
      eq(conversations.workerProfileId, workerProfileId),
    ),
  });
  if (!convo) throw new NotFoundError("Gagal membuka percakapan");

  const jobArea = area || app.serviceAreas?.[0] || "Manado";

  // Catat sebagai booking (permintaan masuk).
  const [booking] = await db
    .insert(bookings)
    .values({
      workerApplicationId: app.id,
      customerName: me.fullName ?? "Pencari",
      customerAvatar: me.avatarUrl ?? null,
      jobTitle,
      area: jobArea,
      scheduledAt: preferredAt ? new Date(preferredAt) : null,
      status: "new",
      note: note ?? null,
    })
    .returning();

  // Ringkasan permintaan sebagai pesan sistem di chat (konteks untuk pekerja).
  const summary =
    `Permintaan baru: ${jobTitle}\n` +
    `Area: ${jobArea}\n` +
    `Waktu diinginkan: ${fmtWaktu(preferredAt)}` +
    (note ? `\nCatatan: ${note}` : "");
  await db.insert(messages).values({
    conversationId: convo.id,
    senderProfileId: me.id,
    type: "system",
    body: summary,
    payload: { kind: "request", jobTitle, area: jobArea, preferredAt, note },
  });
  await db
    .update(conversations)
    .set({ lastMessage: `Permintaan: ${jobTitle}`, lastMessageAt: new Date() })
    .where(eq(conversations.id, convo.id));

  // Push ke pekerja (muncul walau aplikasi tertutup).
  void sendPushToProfile(workerProfileId, {
    title: "Permintaan pekerjaan baru",
    body: `${me.fullName ?? "Pencari"}: ${jobTitle}`,
    url: "/mitra/pesan",
  });

  // Email ke pekerja (non blocking).
  if (app.profile.email) {
    const link = `${env.APP_URL}/mitra/pesan`;
    void sendEmail({
      to: app.profile.email,
      subject: `Permintaan baru dari ${me.fullName ?? "pencari"}: ${jobTitle}`,
      html: emailShell(`
        <p style="margin:0 0 12px;font-size:16px;font-weight:700">Ada permintaan pekerjaan baru</p>
        <p style="margin:0 0 16px;color:#3c4a44">${me.fullName ?? "Seorang pencari"} ingin memakai jasamu.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:6px 0;color:#6b7d76">Pekerjaan</td><td style="padding:6px 0;font-weight:700">${jobTitle}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7d76">Area</td><td style="padding:6px 0;font-weight:700">${jobArea}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7d76">Waktu</td><td style="padding:6px 0;font-weight:700">${fmtWaktu(preferredAt)}</td></tr>
          ${note ? `<tr><td style="padding:6px 0;color:#6b7d76">Catatan</td><td style="padding:6px 0">${note}</td></tr>` : ""}
        </table>
        <a href="${link}" style="display:inline-block;margin-top:20px;background:#16a34a;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:12px">Balas di Torano</a>
      `),
    });
  }

  sendSuccess(
    res,
    { conversationId: convo.id, bookingId: booking?.id },
    { statusCode: 201, message: "Permintaan terkirim" },
  );
}
