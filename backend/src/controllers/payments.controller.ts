import type { Request, Response } from "express";
import { and, eq, sql } from "drizzle-orm";
import { db } from "../config/database.js";
import { conversations, messages, payments } from "../db/schema/index.js";
import { sendSuccess } from "../shared/http/index.js";
import { env } from "../config/env.js";
import {
  NotFoundError,
  AuthorizationError,
  ValidationError,
  AppError,
} from "../shared/errors/index.js";
import {
  createSnapToken,
  getTransactionStatus,
  isPaid,
  verifySignature,
  midtransConfigured,
} from "../shared/midtrans/index.js";

const rupiah = (n: number) => "Rp" + n.toLocaleString("id-ID");

async function getConversationFor(conversationId: string, profileId: string) {
  const c = await db.query.conversations.findFirst({
    where: eq(conversations.id, conversationId),
  });
  if (!c) throw new NotFoundError("Percakapan tidak ditemukan");
  if (c.customerProfileId !== profileId && c.workerProfileId !== profileId) {
    throw new AuthorizationError("Bukan peserta percakapan");
  }
  return c;
}

async function touchConversation(id: string, last: string) {
  await db
    .update(conversations)
    .set({ lastMessage: last, lastMessageAt: new Date() })
    .where(eq(conversations.id, id));
}

async function insertMessage(
  conversationId: string,
  senderProfileId: string,
  type: string,
  body: string,
  payload: unknown,
) {
  const [m] = await db
    .insert(messages)
    .values({ conversationId, senderProfileId, type, body, payload })
    .returning();
  return m;
}

// POST /api/payments/offer — kirim penawaran harga (harga dalam rupiah penuh).
export async function sendOffer(req: Request, res: Response): Promise<void> {
  const me = req.profile!.id;
  const { conversationId, amount, note } = req.body as {
    conversationId: string;
    amount: number;
    note?: string;
  };
  await getConversationFor(conversationId, me);
  if (!Number.isFinite(amount) || amount < 1000) {
    throw new ValidationError("Harga penawaran tidak valid");
  }
  const msg = await insertMessage(conversationId, me, "offer", `Penawaran ${rupiah(amount)}`, {
    amount,
    note: note ?? null,
    status: "pending",
  });
  await touchConversation(conversationId, `Penawaran ${rupiah(amount)}`);
  sendSuccess(res, { message: msg }, { statusCode: 201 });
}

// POST /api/payments/offer/:messageId/respond — terima/tolak penawaran.
export async function respondOffer(req: Request, res: Response): Promise<void> {
  const me = req.profile!.id;
  const messageId = req.params["messageId"] as string;
  const { action } = req.body as { action: "accept" | "decline" };

  const offer = await db.query.messages.findFirst({
    where: eq(messages.id, messageId),
  });
  if (!offer || offer.type !== "offer") {
    throw new NotFoundError("Penawaran tidak ditemukan");
  }
  const convo = await getConversationFor(offer.conversationId, me);
  if (offer.senderProfileId === me) {
    throw new AuthorizationError("Penawaranmu sendiri hanya bisa dijawab pihak lain");
  }
  const payload = (offer.payload ?? {}) as Record<string, unknown>;
  if (payload["status"] !== "pending") {
    throw new ValidationError("Penawaran ini sudah dijawab");
  }
  const amount = Number(payload["amount"] ?? 0);

  if (action === "decline") {
    await db
      .update(messages)
      .set({ payload: { ...payload, status: "declined" } })
      .where(eq(messages.id, messageId));
    await insertMessage(offer.conversationId, me, "system", "Penawaran ditolak.", {
      kind: "offer-declined",
    });
    await touchConversation(offer.conversationId, "Penawaran ditolak");
    sendSuccess(res, { ok: true });
    return;
  }

  // Terima: tandai accepted, buat tagihan pembayaran + kartu pembayaran.
  await db
    .update(messages)
    .set({ payload: { ...payload, status: "accepted" } })
    .where(eq(messages.id, messageId));

  const feePct = env.PLATFORM_FEE_PCT;
  const platformFee = Math.round((amount * feePct) / 100);
  const workerAmount = amount - platformFee;

  const [pay] = await db
    .insert(payments)
    .values({
      conversationId: offer.conversationId,
      customerProfileId: convo.customerProfileId,
      workerProfileId: convo.workerProfileId,
      amount: String(amount),
      platformFee: String(platformFee),
      workerAmount: String(workerAmount),
      status: "pending",
    })
    .returning();

  await insertMessage(
    offer.conversationId,
    me,
    "payment",
    `Tagihan ${rupiah(amount)}`,
    {
      paymentId: pay!.id,
      amount,
      platformFee,
      workerAmount,
      status: "pending",
    },
  );
  await touchConversation(offer.conversationId, `Penawaran disepakati ${rupiah(amount)}`);
  sendSuccess(res, { paymentId: pay!.id });
}

async function loadPayment(id: string, me: string) {
  const [pay] = await db.select().from(payments).where(eq(payments.id, id));
  if (!pay) throw new NotFoundError("Tagihan tidak ditemukan");
  if (pay.customerProfileId !== me && pay.workerProfileId !== me) {
    throw new AuthorizationError("Bukan peserta transaksi");
  }
  return pay;
}

// Perbarui payload kartu pembayaran (status) di chat.
async function updatePaymentCard(paymentId: string, status: string) {
  const rows = await db
    .select()
    .from(messages)
    .where(
      and(eq(messages.type, "payment"), sql`${messages.payload}->>'paymentId' = ${paymentId}`),
    );
  for (const m of rows) {
    const p = (m.payload ?? {}) as Record<string, unknown>;
    await db
      .update(messages)
      .set({ payload: { ...p, status } })
      .where(eq(messages.id, m.id));
  }
}

// POST /api/payments/:id/snap — buat token Snap (hanya pencari).
export async function createSnap(req: Request, res: Response): Promise<void> {
  const me = req.profile!.id;
  const pay = await loadPayment(req.params["id"] as string, me);
  if (pay.customerProfileId !== me) {
    throw new AuthorizationError("Hanya pencari yang membayar");
  }
  if (pay.status !== "pending") {
    throw new ValidationError("Tagihan ini sudah diproses");
  }
  if (!midtransConfigured()) {
    throw new AppError(
      "Pembayaran belum aktif. Admin perlu memasang kunci Midtrans Sandbox.",
      503,
      "INTERNAL_SERVER_ERROR",
    );
  }

  // Order id unik tiap percobaan (Midtrans mengunci order id yang sudah dipakai).
  const orderId = `TRN-${pay.id.slice(0, 8)}-${Date.now().toString().slice(-6)}`;
  let token: string;
  try {
    ({ token } = await createSnapToken(
      orderId,
      Number(pay.amount),
      { name: req.profile!.fullName, email: req.profile!.email },
      "Jasa Torano",
    ));
  } catch (err) {
    throw new AppError(
      err instanceof Error ? err.message : "Gagal membuat pembayaran",
      502,
      "INTERNAL_SERVER_ERROR",
    );
  }
  await db
    .update(payments)
    .set({ orderId, snapToken: token })
    .where(eq(payments.id, pay.id));

  sendSuccess(res, {
    token,
    orderId,
    clientKey: env.MIDTRANS_CLIENT_KEY,
    isProduction: env.MIDTRANS_IS_PRODUCTION,
  });
}

// POST /api/payments/:id/confirm — verifikasi status ke Midtrans, tandai ditahan.
export async function confirmPayment(req: Request, res: Response): Promise<void> {
  const me = req.profile!.id;
  const pay = await loadPayment(req.params["id"] as string, me);
  if (pay.status === "held" || pay.status === "released") {
    sendSuccess(res, { status: pay.status });
    return;
  }
  if (!pay.orderId) throw new ValidationError("Pembayaran belum dimulai");

  const status = await getTransactionStatus(pay.orderId);
  if (!isPaid(status)) {
    sendSuccess(res, { status: "pending", detail: status.transaction_status });
    return;
  }

  await db
    .update(payments)
    .set({
      status: "held",
      method: status.payment_type ?? null,
      gatewayRef: status.transaction_id ?? null,
      paidAt: new Date(),
    })
    .where(eq(payments.id, pay.id));
  await updatePaymentCard(pay.id, "held");
  if (pay.conversationId) {
    await insertMessage(
      pay.conversationId,
      me,
      "system",
      `Dana ${rupiah(Number(pay.amount))} ditahan Torano. Pekerjaan bisa dimulai.`,
      { kind: "payment-held", paymentId: pay.id },
    );
    await touchConversation(pay.conversationId, "Dana ditahan");
  }
  sendSuccess(res, { status: "held" });
}

// POST /api/payments/:id/release — lepas dana ke pekerja (pekerjaan selesai).
export async function releasePayment(req: Request, res: Response): Promise<void> {
  const me = req.profile!.id;
  const pay = await loadPayment(req.params["id"] as string, me);
  if (pay.status !== "held") {
    throw new ValidationError("Dana hanya bisa dilepas setelah ditahan");
  }
  await db
    .update(payments)
    .set({ status: "released", releasedAt: new Date() })
    .where(eq(payments.id, pay.id));
  await updatePaymentCard(pay.id, "released");
  if (pay.conversationId) {
    await insertMessage(
      pay.conversationId,
      me,
      "system",
      `Dana dilepas ke pekerja: ${rupiah(Number(pay.workerAmount))} (potongan layanan ${rupiah(Number(pay.platformFee))}).`,
      { kind: "payment-released", paymentId: pay.id },
    );
    await touchConversation(pay.conversationId, "Dana dilepas");
  }
  sendSuccess(res, { status: "released" });
}

// POST /api/payments/webhook — notifikasi Midtrans (produksi, tanpa auth).
export async function webhook(req: Request, res: Response): Promise<void> {
  const body = req.body as {
    order_id?: string;
    status_code?: string;
    gross_amount?: string;
    signature_key?: string;
    transaction_status?: string;
    payment_type?: string;
    transaction_id?: string;
    fraud_status?: string;
  };
  if (!verifySignature(body) || !body.order_id) {
    res.status(200).json({ ok: true });
    return;
  }
  const [pay] = await db
    .select()
    .from(payments)
    .where(eq(payments.orderId, body.order_id));
  if (pay && pay.status === "pending" && isPaid(body)) {
    await db
      .update(payments)
      .set({
        status: "held",
        method: body.payment_type ?? null,
        gatewayRef: body.transaction_id ?? null,
        paidAt: new Date(),
      })
      .where(eq(payments.id, pay.id));
    await updatePaymentCard(pay.id, "held");
  }
  res.status(200).json({ ok: true });
}
