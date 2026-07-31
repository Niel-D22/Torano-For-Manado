import type { Request, Response } from "express";
import { and, asc, eq, isNull, ne, or } from "drizzle-orm";
import { db } from "../config/database.js";
import { conversations, messages } from "../db/schema/index.js";
import { sendSuccess, sendList } from "../shared/http/index.js";
import { NotFoundError, AuthorizationError } from "../shared/errors/index.js";
import { sendPushToProfile } from "../shared/push/index.js";

async function assertParticipant(conversationId: string, profileId: string) {
  const c = await db.query.conversations.findFirst({
    where: eq(conversations.id, conversationId),
  });
  if (!c) throw new NotFoundError("Percakapan tidak ditemukan");
  if (c.customerProfileId !== profileId && c.workerProfileId !== profileId) {
    throw new AuthorizationError("Bukan peserta percakapan");
  }
  return c;
}

const preview = (type: string, body?: string | null) =>
  body ||
  (type === "location"
    ? "Lokasi dibagikan"
    : type === "offer"
      ? "Tawaran harga"
      : type === "payment"
        ? "Pembayaran"
        : "Pesan");

// GET /api/chat/conversations
export async function listConversations(req: Request, res: Response): Promise<void> {
  const me = req.profile!.id;
  const rows = await db.query.conversations.findMany({
    where: or(
      eq(conversations.customerProfileId, me),
      eq(conversations.workerProfileId, me),
    ),
    with: { customer: true, worker: true },
    orderBy: (t, { desc }) => [desc(t.lastMessageAt)],
  });
  const data = rows.map((c) => {
    const other = c.customerProfileId === me ? c.worker : c.customer;
    return {
      id: c.id,
      name: other?.fullName ?? "Pengguna",
      avatarUrl: other?.avatarUrl ?? null,
      lastMessage: c.lastMessage,
      lastMessageAt: c.lastMessageAt,
    };
  });
  sendList(res, data, { total: data.length });
}

// GET /api/chat/conversations/:id/messages
export async function getMessages(req: Request, res: Response): Promise<void> {
  const id = req.params["id"] as string;
  await assertParticipant(id, req.profile!.id);
  const me = req.profile!.id;

  const c = await db.query.conversations.findFirst({
    where: eq(conversations.id, id),
    with: { customer: true, worker: true },
  });
  const other = c!.customerProfileId === me ? c!.worker : c!.customer;

  const items = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt));

  // Tandai pesan dari lawan bicara sebagai sudah dibaca → lonceng notifikasi turun.
  await db
    .update(messages)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(messages.conversationId, id),
        ne(messages.senderProfileId, me),
        isNull(messages.readAt),
      ),
    );

  sendSuccess(res, {
    conversation: {
      id,
      meId: me,
      iAmCustomer: c!.customerProfileId === me,
      customerProfileId: c!.customerProfileId,
      workerProfileId: c!.workerProfileId,
      other: { id: other?.id, name: other?.fullName, avatarUrl: other?.avatarUrl },
    },
    messages: items,
  });
}

// POST /api/chat/conversations/:id/messages
export async function sendMessage(req: Request, res: Response): Promise<void> {
  const id = req.params["id"] as string;
  const c = await assertParticipant(id, req.profile!.id);
  const me = req.profile!.id;
  const { type = "text", body, payload } = req.body as {
    type?: string;
    body?: string;
    payload?: unknown;
  };

  const [msg] = await db
    .insert(messages)
    .values({
      conversationId: id,
      senderProfileId: me,
      type,
      body: body ?? null,
      payload: payload ?? null,
    })
    .returning();

  await db
    .update(conversations)
    .set({ lastMessage: preview(type, body), lastMessageAt: new Date() })
    .where(eq(conversations.id, id));

  // Push ke lawan bicara (muncul walau aplikasi tertutup).
  const recipient = c.customerProfileId === me ? c.workerProfileId : c.customerProfileId;
  const url = recipient === c.workerProfileId ? "/mitra/pesan" : "/chat";
  void sendPushToProfile(recipient, {
    title: `Pesan dari ${req.profile!.fullName ?? "pengguna"}`,
    body: preview(type, body),
    url,
  });

  sendSuccess(res, { message: msg }, { statusCode: 201 });
}

// POST /api/chat/conversations — mulai/ambil percakapan dengan worker.
export async function startConversation(req: Request, res: Response): Promise<void> {
  const me = req.profile!.id;
  const { workerProfileId } = req.body as { workerProfileId: string };

  const existing = await db.query.conversations.findFirst({
    where: and(
      eq(conversations.customerProfileId, me),
      eq(conversations.workerProfileId, workerProfileId),
    ),
  });
  if (existing) {
    sendSuccess(res, { conversation: existing });
    return;
  }
  const [created] = await db
    .insert(conversations)
    .values({ customerProfileId: me, workerProfileId })
    .returning();
  sendSuccess(res, { conversation: created }, { statusCode: 201 });
}
