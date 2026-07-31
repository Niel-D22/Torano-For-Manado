import type { Request, Response } from "express";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "../config/database.js";
import {
  disputes,
  payments,
  profiles,
  messages,
  conversations,
  workerApplications,
  bookings,
} from "../db/schema/index.js";
import { sendSuccess, sendList } from "../shared/http/index.js";
import {
  NotFoundError,
  AuthorizationError,
  ValidationError,
} from "../shared/errors/index.js";

const toNum = (v: unknown) => Number(v ?? 0);

const disputeCode = () => {
  const d = new Date();
  const ymd =
    String(d.getFullYear()).slice(2) +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0");
  return `DS-${ymd}-${String(Math.floor(1000 + Math.random() * 9000))}`;
};

// Perbarui status di kartu pembayaran dalam chat.
async function updatePaymentCard(paymentId: string, status: string) {
  const rows = await db
    .select()
    .from(messages)
    .where(and(eq(messages.type, "payment"), sql`${messages.payload}->>'paymentId' = ${paymentId}`));
  for (const m of rows) {
    const p = (m.payload ?? {}) as Record<string, unknown>;
    await db.update(messages).set({ payload: { ...p, status } }).where(eq(messages.id, m.id));
  }
}

/**
 * POST /api/disputes — pelanggan atau mitra melaporkan sengketa atas transaksi
 * escrow yang dananya ditahan.
 */
export async function createDispute(req: Request, res: Response): Promise<void> {
  const me = req.profile!;
  const { paymentId, reason, description, evidence } = req.body as {
    paymentId: string;
    reason: string;
    description?: string;
    evidence?: string[];
  };

  const [pay] = await db.select().from(payments).where(eq(payments.id, paymentId));
  if (!pay) throw new NotFoundError("Transaksi tidak ditemukan");
  if (pay.customerProfileId !== me.id && pay.workerProfileId !== me.id) {
    throw new AuthorizationError("Bukan peserta transaksi ini");
  }
  if (pay.status !== "held" && pay.status !== "disputed") {
    throw new ValidationError("Sengketa hanya untuk dana yang masih ditahan");
  }

  const existing = await db
    .select()
    .from(disputes)
    .where(and(eq(disputes.paymentId, paymentId), sql`${disputes.status} <> 'resolved'`));
  if (existing.length > 0) {
    throw new ValidationError("Sengketa untuk transaksi ini sudah ada");
  }

  const role = pay.customerProfileId === me.id ? "customer" : "worker";

  // Ambil judul & area pekerjaan dari worker application + booking terkait.
  const app = await db.query.workerApplications.findFirst({
    where: eq(workerApplications.profileId, pay.workerProfileId),
  });
  let jobTitle = "Pekerjaan Torano";
  let area: string | null = app?.serviceAreas?.[0] ?? null;
  if (app) {
    const [bk] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.workerApplicationId, app.id))
      .orderBy(desc(bookings.createdAt))
      .limit(1);
    if (bk) {
      jobTitle = bk.jobTitle;
      area = bk.area ?? area;
    }
  }

  const evidenceArr = Array.isArray(evidence) ? evidence.slice(0, 6) : [];

  const [created] = await db
    .insert(disputes)
    .values({
      code: disputeCode(),
      paymentId: pay.id,
      conversationId: pay.conversationId,
      customerProfileId: pay.customerProfileId,
      workerProfileId: pay.workerProfileId,
      workerApplicationId: app?.id ?? null,
      jobTitle,
      area,
      amount: pay.amount,
      reportedByProfileId: me.id,
      reportedByRole: role,
      reason,
      description: description ?? null,
      evidenceCustomer: role === "customer" ? evidenceArr : [],
      evidenceWorker: role === "worker" ? evidenceArr : [],
      status: "open",
    })
    .returning();

  // Tandai pembayaran sedang disengketakan (dana tetap ditahan).
  await db.update(payments).set({ status: "disputed" }).where(eq(payments.id, pay.id));
  await updatePaymentCard(pay.id, "disputed");
  if (pay.conversationId) {
    await db.insert(messages).values({
      conversationId: pay.conversationId,
      senderProfileId: me.id,
      type: "system",
      body: `Sengketa dibuka (${created!.code}). Dana ditahan hingga admin memutuskan.`,
      payload: { kind: "dispute-open", disputeId: created!.id },
    });
    await db
      .update(conversations)
      .set({ lastMessage: "Sengketa dibuka", lastMessageAt: new Date() })
      .where(eq(conversations.id, pay.conversationId));
  }

  sendSuccess(res, { dispute: { id: created!.id, code: created!.code } }, { statusCode: 201 });
}

// ── Admin ──

const STATUS_TABS = ["open", "reviewing", "resolved"] as const;

// GET /api/admin/disputes?status=&q=
export async function listDisputes(req: Request, res: Response): Promise<void> {
  const statusQ = String(req.query["status"] ?? "").trim();
  const q = String(req.query["q"] ?? "").trim().toLowerCase();

  const rows = await db.select().from(disputes).orderBy(desc(disputes.createdAt));
  const ids = [...new Set(rows.flatMap((d) => [d.customerProfileId, d.workerProfileId]))];
  const profs = ids.length
    ? await db.select().from(profiles).where(inArray(profiles.id, ids))
    : [];
  const pmap = new Map(profs.map((p) => [p.id, p]));

  const counts = {
    all: rows.length,
    open: rows.filter((d) => d.status === "open").length,
    reviewing: rows.filter((d) => d.status === "reviewing").length,
    resolved: rows.filter((d) => d.status === "resolved").length,
  };

  let data = rows.map((d) => {
    const c = pmap.get(d.customerProfileId);
    const w = pmap.get(d.workerProfileId);
    return {
      id: d.id,
      code: d.code,
      status: d.status,
      jobTitle: d.jobTitle,
      area: d.area,
      amount: toNum(d.amount),
      createdAt: d.createdAt,
      customer: { name: c?.fullName ?? "Pelanggan", avatar: c?.avatarUrl ?? null },
      worker: { name: w?.fullName ?? "Mitra", avatar: w?.avatarUrl ?? null },
    };
  });

  if ((STATUS_TABS as readonly string[]).includes(statusQ))
    data = data.filter((d) => d.status === statusQ);
  if (q)
    data = data.filter((d) =>
      `${d.code} ${d.customer.name} ${d.worker.name} ${d.jobTitle}`.toLowerCase().includes(q),
    );

  sendList(res, data, { total: data.length, counts });
}

// GET /api/admin/disputes/:id
export async function getDispute(req: Request, res: Response): Promise<void> {
  const id = req.params["id"] as string;
  const [d] = await db.select().from(disputes).where(eq(disputes.id, id));
  if (!d) throw new NotFoundError("Sengketa tidak ditemukan");

  const [c] = await db.select().from(profiles).where(eq(profiles.id, d.customerProfileId));
  const [w] = await db.select().from(profiles).where(eq(profiles.id, d.workerProfileId));

  let chat: Array<{ id: string; name: string; avatar: string | null; body: string | null; type: string; at: Date }> = [];
  if (d.conversationId) {
    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, d.conversationId))
      .orderBy(messages.createdAt);
    chat = msgs.map((m) => {
      const sender = m.senderProfileId === d.customerProfileId ? c : w;
      return {
        id: m.id,
        name: sender?.fullName ?? "Pengguna",
        avatar: sender?.avatarUrl ?? null,
        body: m.body,
        type: m.type,
        at: m.createdAt,
      };
    });
  }

  const history = [
    { key: "open", label: "Dilaporkan", at: d.createdAt, note: `Sengketa dilaporkan oleh ${d.reportedByRole === "customer" ? "pelanggan" : "mitra"} (${(d.reportedByRole === "customer" ? c : w)?.fullName ?? ""})` },
    { key: "reviewing", label: "Ditinjau", at: d.reviewedAt, note: d.reviewedAt ? "Sedang ditinjau oleh Admin" : "Menunggu peninjauan" },
    { key: "resolved", label: "Selesai", at: d.resolvedAt, note: d.resolvedAt ? "Keputusan resolusi diterapkan" : "Menunggu keputusan resolusi" },
  ];

  sendSuccess(res, {
    dispute: {
      id: d.id,
      code: d.code,
      status: d.status,
      reason: d.reason,
      description: d.description,
      jobTitle: d.jobTitle,
      area: d.area,
      amount: toNum(d.amount),
      createdAt: d.createdAt,
      reviewedAt: d.reviewedAt,
      resolvedAt: d.resolvedAt,
      resolution: d.resolution,
      adminNote: d.adminNote,
      transactionCode: d.paymentId && d.code ? `TRX-${d.code.replace("DS-", "")}` : null,
      paymentStatus: d.status === "resolved" ? d.resolution : "held",
      customer: c ? { name: c.fullName, email: c.email, phone: c.phone, avatar: c.avatarUrl } : null,
      worker: w ? { name: w.fullName, email: w.email, phone: w.phone, avatar: w.avatarUrl } : null,
      evidenceCustomer: d.evidenceCustomer ?? [],
      evidenceWorker: d.evidenceWorker ?? [],
      chat,
      history,
    },
  });
}

// PATCH /api/admin/disputes/:id/review
export async function reviewDispute(req: Request, res: Response): Promise<void> {
  const id = req.params["id"] as string;
  const [d] = await db.select().from(disputes).where(eq(disputes.id, id));
  if (!d) throw new NotFoundError("Sengketa tidak ditemukan");
  if (d.status === "open") {
    await db
      .update(disputes)
      .set({ status: "reviewing", reviewedAt: new Date() })
      .where(eq(disputes.id, id));
  }
  sendSuccess(res, { status: "reviewing" });
}

// PATCH /api/admin/disputes/:id/resolve { resolution, adminNote }
export async function resolveDispute(req: Request, res: Response): Promise<void> {
  const id = req.params["id"] as string;
  const { resolution, adminNote } = req.body as { resolution: string; adminNote: string };
  if (!["release", "refund", "split"].includes(resolution)) {
    throw new ValidationError("Pilih tindakan resolusi");
  }
  if (!adminNote || !adminNote.trim()) {
    throw new ValidationError("Catatan admin wajib diisi");
  }
  const [d] = await db.select().from(disputes).where(eq(disputes.id, id));
  if (!d) throw new NotFoundError("Sengketa tidak ditemukan");
  if (d.status === "resolved") throw new ValidationError("Sengketa sudah diselesaikan");

  // Terapkan ke pembayaran.
  if (d.paymentId) {
    const payStatus = resolution === "refund" ? "refunded" : "released";
    const stamp = resolution === "refund" ? { refundedAt: new Date() } : { releasedAt: new Date() };
    await db.update(payments).set({ status: payStatus, ...stamp }).where(eq(payments.id, d.paymentId));
    await updatePaymentCard(d.paymentId, payStatus);
  }

  await db
    .update(disputes)
    .set({ status: "resolved", resolution, adminNote: adminNote.trim(), resolvedAt: new Date() })
    .where(eq(disputes.id, id));

  const label =
    resolution === "release"
      ? "Dana dilepas ke mitra"
      : resolution === "refund"
        ? "Dana dikembalikan ke pelanggan"
        : "Dana dibagi antara pelanggan dan mitra";
  if (d.conversationId) {
    await db.insert(messages).values({
      conversationId: d.conversationId,
      senderProfileId: d.reportedByProfileId,
      type: "system",
      body: `Sengketa ${d.code} selesai. Keputusan admin: ${label}.`,
      payload: { kind: "dispute-resolved", resolution },
    });
  }

  sendSuccess(res, { status: "resolved", resolution }, { message: label });
}
