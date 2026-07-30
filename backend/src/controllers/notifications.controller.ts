import type { Request, Response } from "express";
import { and, desc, eq, inArray, isNull, ne, or } from "drizzle-orm";
import { db } from "../config/database.js";
import {
  conversations,
  messages,
  bookings,
  reviews,
  workerApplications,
} from "../db/schema/index.js";
import { sendSuccess } from "../shared/http/index.js";
import { AuthenticationError } from "../shared/errors/index.js";

interface Notif {
  id: string;
  type: "message" | "booking" | "review";
  title: string;
  body: string;
  at: Date;
  link: string;
  unread: boolean;
}

/**
 * GET /api/notifications — notifikasi nyata dari data pengguna.
 * Pencari & pekerja: pesan chat yang belum dibaca. Pekerja: permintaan
 * booking baru & ulasan terbaru. Badge = pesan belum dibaca + booking baru.
 */
export async function listNotifications(
  req: Request,
  res: Response,
): Promise<void> {
  const profile = req.profile;
  if (!profile) throw new AuthenticationError("Sesi tidak valid");
  const pid = profile.id;
  const items: Notif[] = [];

  // 1) Pesan chat belum dibaca (berlaku untuk kedua peran).
  const convs = await db.query.conversations.findMany({
    where: or(
      eq(conversations.customerProfileId, pid),
      eq(conversations.workerProfileId, pid),
    ),
    with: { customer: true, worker: true },
  });
  const convMap = new Map(convs.map((c) => [c.id, c]));
  const convIds = convs.map((c) => c.id);

  let unreadMessages = 0;
  if (convIds.length) {
    const unread = await db.query.messages.findMany({
      where: and(
        inArray(messages.conversationId, convIds),
        ne(messages.senderProfileId, pid),
        isNull(messages.readAt),
      ),
      orderBy: desc(messages.createdAt),
      limit: 20,
    });
    unreadMessages = unread.length;
    for (const m of unread) {
      const c = convMap.get(m.conversationId);
      const sender =
        c && c.customerProfileId === pid ? c.worker : c?.customer;
      const body =
        m.type === "offer"
          ? "Mengirim tawaran harga"
          : m.type === "location"
            ? "Membagikan lokasi"
            : m.body || "Pesan baru";
      items.push({
        id: `msg-${m.id}`,
        type: "message",
        title: `Pesan dari ${sender?.fullName ?? "pengguna"}`,
        body,
        at: m.createdAt,
        link: "/chat",
        unread: true,
      });
    }
  }

  // 2) Khusus pekerja: booking baru & ulasan.
  let newBookings = 0;
  if (profile.role === "worker") {
    const app = await db.query.workerApplications.findFirst({
      where: eq(workerApplications.profileId, pid),
    });
    if (app) {
      const bks = await db.query.bookings.findMany({
        where: eq(bookings.workerApplicationId, app.id),
        orderBy: desc(bookings.createdAt),
        limit: 10,
      });
      for (const b of bks) {
        const isNew = b.status === "new";
        if (isNew) newBookings++;
        items.push({
          id: `bk-${b.id}`,
          type: "booking",
          title: isNew ? "Permintaan pekerjaan baru" : "Pesanan diperbarui",
          body: `${b.customerName} - ${b.jobTitle}`,
          at: b.createdAt,
          link: "/mitra/jadwal",
          unread: isNew,
        });
      }
      const rvs = await db.query.reviews.findMany({
        where: eq(reviews.workerApplicationId, app.id),
        orderBy: desc(reviews.createdAt),
        limit: 5,
      });
      for (const r of rvs) {
        items.push({
          id: `rv-${r.id}`,
          type: "review",
          title: `Ulasan ${r.rating} bintang dari ${r.reviewerName}`,
          body: r.comment || "Tidak ada komentar",
          at: r.createdAt,
          link: "/mitra/ulasan",
          unread: false,
        });
      }
    }
  }

  items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  sendSuccess(res, {
    items: items.slice(0, 20),
    unreadCount: unreadMessages + newBookings,
  });
}
