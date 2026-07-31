import type { Request, Response } from "express";
import { desc, eq } from "drizzle-orm";
import { db } from "../config/database.js";
import { reports } from "../db/schema/index.js";
import { sendSuccess, sendList } from "../shared/http/index.js";
import { NotFoundError } from "../shared/errors/index.js";

// POST /api/reports — pencari atau pekerja melaporkan kendala ke admin.
export async function createReport(req: Request, res: Response): Promise<void> {
  const me = req.profile!;
  const { category, subject, message } = req.body as {
    category?: string;
    subject: string;
    message: string;
  };
  const [row] = await db
    .insert(reports)
    .values({
      reporterProfileId: me.id,
      reporterRole: me.role ?? "customer",
      reporterName: me.fullName ?? "Pengguna",
      reporterEmail: me.email ?? null,
      category: category ?? "Umum",
      subject,
      message,
      status: "open",
    })
    .returning();
  sendSuccess(res, { report: { id: row?.id } }, { statusCode: 201, message: "Laporan terkirim" });
}

// GET /api/reports/me — laporan milik pengguna sendiri.
export async function listMyReports(req: Request, res: Response): Promise<void> {
  const rows = await db
    .select()
    .from(reports)
    .where(eq(reports.reporterProfileId, req.profile!.id))
    .orderBy(desc(reports.createdAt));
  sendList(res, rows, { total: rows.length });
}

// ── Admin ──

// GET /api/admin/reports
export async function listReports(req: Request, res: Response): Promise<void> {
  const statusQ = String(req.query["status"] ?? "").trim();
  const rows = await db.select().from(reports).orderBy(desc(reports.createdAt));
  const counts = {
    all: rows.length,
    open: rows.filter((r) => r.status === "open").length,
    resolved: rows.filter((r) => r.status === "resolved").length,
  };
  const data = statusQ === "open" || statusQ === "resolved"
    ? rows.filter((r) => r.status === statusQ)
    : rows;
  sendList(res, data, { total: data.length, counts });
}

// PATCH /api/admin/reports/:id — balas / tandai selesai.
export async function updateReport(req: Request, res: Response): Promise<void> {
  const id = req.params["id"] as string;
  const { status, adminReply } = req.body as { status?: string; adminReply?: string };
  const set: Record<string, unknown> = {};
  if (adminReply !== undefined) set["adminReply"] = adminReply;
  if (status === "resolved") {
    set["status"] = "resolved";
    set["resolvedAt"] = new Date();
  } else if (status === "open") {
    set["status"] = "open";
    set["resolvedAt"] = null;
  }
  const [updated] = await db.update(reports).set(set).where(eq(reports.id, id)).returning();
  if (!updated) throw new NotFoundError("Laporan tidak ditemukan");
  sendSuccess(res, { report: updated }, { message: "Laporan diperbarui" });
}
