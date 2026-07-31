import type { Request, Response } from "express";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "../config/database.js";
import {
  profiles,
  workerApplications,
  categories,
  bookings,
  payments,
  withdrawals,
  disputes,
  messages,
  reports,
} from "../db/schema/index.js";
import { sendSuccess, sendList } from "../shared/http/index.js";
import { NotFoundError } from "../shared/errors/index.js";

const toNum = (v: unknown) => Number(v ?? 0);
const ymd = (d: Date) =>
  String(d.getFullYear()).slice(2) +
  String(d.getMonth() + 1).padStart(2, "0") +
  String(d.getDate()).padStart(2, "0");
const trxCode = (createdAt: Date | string, id: string) =>
  `TRX-${ymd(new Date(createdAt))}-${id.replace(/\D/g, "").slice(0, 4).padStart(4, "0")}`;
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

// Peta conversationId -> judul pekerjaan (dari pesan sistem "Permintaan").
async function jobTitleMap(): Promise<Map<string, string>> {
  const rows = await db.select().from(messages).where(eq(messages.type, "system"));
  const m = new Map<string, string>();
  for (const r of rows) {
    const p = (r.payload ?? {}) as Record<string, unknown>;
    if (p["kind"] === "request" && typeof p["jobTitle"] === "string" && !m.has(r.conversationId)) {
      m.set(r.conversationId, p["jobTitle"] as string);
    }
  }
  return m;
}

// GET /api/admin/dashboard
export async function getAdminDashboard(_req: Request, res: Response): Promise<void> {
  const [apps, pays, disp, allBookings, cats, wds] = await Promise.all([
    db.query.workerApplications.findMany({ with: { profile: true, category: true } }),
    db.select().from(payments),
    db.select().from(disputes),
    db.select().from(bookings),
    db.select().from(categories),
    db.select().from(withdrawals),
  ]);

  const now = new Date();
  const pendingVerification = apps.filter((a) => a.status === "submitted").length;
  const escrowHeld = pays
    .filter((p) => p.status === "held" || p.status === "disputed")
    .reduce((s, p) => s + toNum(p.amount), 0);
  const openDisputes = disp.filter((d) => d.status !== "resolved").length;
  const paidPays = pays.filter((p) => p.paidAt);
  const transactionsToday = paidPays
    .filter((p) => sameDay(new Date(p.paidAt as Date), now))
    .reduce((s, p) => s + toNum(p.amount), 0);

  // Grafik 7 hari terakhir (nilai transaksi per hari).
  const days: Array<{ date: string; label: string; total: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const total = paidPays
      .filter((p) => sameDay(new Date(p.paidAt as Date), d))
      .reduce((s, p) => s + toNum(p.amount), 0);
    days.push({
      date: d.toISOString(),
      label: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
      total,
    });
  }
  const total7 = days.reduce((s, d) => s + d.total, 0);
  const prev7 = paidPays
    .filter((p) => {
      const t = new Date(p.paidAt as Date).getTime();
      return t < now.getTime() - 7 * 86400000 && t >= now.getTime() - 14 * 86400000;
    })
    .reduce((s, p) => s + toNum(p.amount), 0);
  const changePct = prev7 > 0 ? Math.round(((total7 - prev7) / prev7) * 1000) / 10 : null;

  // Pekerjaan berdasarkan kategori (dari booking).
  const appCat = new Map(apps.map((a) => [a.id, a.category?.name ?? "Lainnya"]));
  const catCount = new Map<string, number>();
  for (const b of allBookings) {
    const name = appCat.get(b.workerApplicationId) ?? "Lainnya";
    catCount.set(name, (catCount.get(name) ?? 0) + 1);
  }
  const catTotal = allBookings.length || 1;
  const categoryBreakdown = [...catCount.entries()]
    .map(([name, count]) => ({ name, count, pct: Math.round((count / catTotal) * 1000) / 10 }))
    .sort((a, b) => b.count - a.count);

  // Aktivitas terbaru.
  type Act = { kind: string; title: string; sub: string; at: Date | string };
  const activity: Act[] = [];
  for (const a of apps.slice(-8))
    activity.push({
      kind: "register",
      title: "Pendaftaran mitra baru",
      sub: `${a.profile?.fullName ?? "Mitra"} mendaftar sebagai ${a.category?.name ?? "mitra"}`,
      at: a.createdAt,
    });
  for (const b of allBookings.filter((x) => x.status === "completed").slice(-8))
    activity.push({
      kind: "completed",
      title: "Pekerjaan selesai",
      sub: `${b.jobTitle} oleh ${b.customerName} telah selesai`,
      at: b.createdAt,
    });
  const appName = new Map(apps.map((a) => [a.id, a.profile?.fullName ?? "Mitra"]));
  for (const w of wds)
    activity.push({
      kind: "payout",
      title: w.status === "requested" ? "Permintaan pencairan" : "Pencairan dana",
      sub: `Mitra ${appName.get(w.workerApplicationId) ?? ""} ${w.status === "requested" ? "meminta" : "mencairkan"} dana Rp${(toNum(w.amount) * 1000).toLocaleString("id-ID")}`,
      at: w.createdAt,
    });
  activity.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  // Perlu tindakan.
  const needsAction: Array<Record<string, unknown>> = [];
  for (const a of apps.filter((x) => x.status === "submitted").slice(0, 4))
    needsAction.push({
      type: "verify",
      id: a.id,
      name: a.profile?.fullName ?? "Mitra",
      sub: a.category?.name ?? "Mitra",
      avatar: a.profilePhotoUrl || a.profile?.avatarUrl || null,
    });
  const dispProfiles = disp.length
    ? await db
        .select()
        .from(profiles)
        .where(inArray(profiles.id, [...new Set(disp.map((d) => d.customerProfileId))]))
    : [];
  const dpMap = new Map(dispProfiles.map((p) => [p.id, p]));
  for (const d of disp.filter((x) => x.status !== "resolved").slice(0, 4))
    needsAction.push({
      type: "dispute",
      id: d.id,
      name: `Sengketa #${d.code}`,
      sub: `${d.jobTitle} oleh ${dpMap.get(d.customerProfileId)?.fullName ?? "pelanggan"}`,
      avatar: dpMap.get(d.customerProfileId)?.avatarUrl ?? null,
    });

  sendSuccess(res, {
    stats: { pendingVerification, transactionsToday, escrowHeld, openDisputes },
    chart: { days, total7, changePct },
    categoryBreakdown,
    categoryTotal: allBookings.length,
    activity: activity.slice(0, 6),
    needsAction: needsAction.slice(0, 5),
  });
}

// GET /api/admin/transactions?status=&q=
export async function listTransactions(req: Request, res: Response): Promise<void> {
  const statusQ = String(req.query["status"] ?? "").trim();
  const q = String(req.query["q"] ?? "").trim().toLowerCase();

  const [pays, wds, jobs] = await Promise.all([
    db.select().from(payments).orderBy(desc(payments.createdAt)),
    db.select().from(withdrawals),
    jobTitleMap(),
  ]);
  const ids = [...new Set(pays.flatMap((p) => [p.customerProfileId, p.workerProfileId]))];
  const profs = ids.length ? await db.select().from(profiles).where(inArray(profiles.id, ids)) : [];
  const pmap = new Map(profs.map((p) => [p.id, p]));

  const STATUS_LABEL = (s: string) =>
    s === "held" || s === "disputed" ? "held" : s === "released" ? "released" : s === "refunded" ? "refunded" : "pending";

  let data = pays.map((p) => {
    const c = pmap.get(p.customerProfileId);
    const w = pmap.get(p.workerProfileId);
    const step = STATUS_LABEL(p.status);
    return {
      id: p.id,
      code: trxCode(p.createdAt, p.id),
      customer: { name: c?.fullName ?? "Pelanggan", avatar: c?.avatarUrl ?? null },
      worker: { name: w?.fullName ?? "Mitra", avatar: w?.avatarUrl ?? null },
      jobTitle: (p.conversationId && jobs.get(p.conversationId)) || "Jasa Torano",
      amount: toNum(p.amount),
      fee: toNum(p.platformFee),
      workerAmount: toNum(p.workerAmount),
      status: step,
      date: p.paidAt ?? p.createdAt,
      timeline: [
        { label: "Dibayar", at: p.paidAt, note: "Pembayaran berhasil masuk ke escrow" },
        { label: "Dana ditahan", at: p.paidAt, note: "Dana diamankan Torano" },
        {
          label: p.status === "refunded" ? "Dana dikembalikan" : "Dana dilepas ke saldo mitra",
          at: p.releasedAt ?? p.refundedAt,
          note:
            p.status === "refunded"
              ? "Dana dikembalikan ke pelanggan"
              : `Rp${toNum(p.workerAmount).toLocaleString("id-ID")} dilepas ke saldo mitra`,
        },
      ],
    };
  });

  const counts = {
    all: data.length,
    held: data.filter((d) => d.status === "held").length,
    released: data.filter((d) => d.status === "released").length,
    refunded: data.filter((d) => d.status === "refunded").length,
    pencairan: wds.length,
  };

  if (["held", "released", "refunded"].includes(statusQ))
    data = data.filter((d) => d.status === statusQ);
  if (q)
    data = data.filter((d) =>
      `${d.code} ${d.customer.name} ${d.worker.name} ${d.jobTitle}`.toLowerCase().includes(q),
    );

  // Ringkasan kanan.
  const escrowHeld = pays
    .filter((p) => p.status === "held" || p.status === "disputed")
    .reduce((s, p) => s + toNum(p.amount), 0);
  const heldCount = pays.filter((p) => p.status === "held" || p.status === "disputed").length;

  const appIds = [...new Set(wds.map((w) => w.workerApplicationId))];
  const apps = appIds.length
    ? await db.query.workerApplications.findMany({
        where: inArray(workerApplications.id, appIds),
        with: { profile: true, category: true },
      })
    : [];
  const appInfo = new Map(apps.map((a) => [a.id, a]));
  const withdrawalRequests = wds
    .filter((w) => w.status === "requested")
    .map((w) => {
      const a = appInfo.get(w.workerApplicationId);
      return {
        id: w.id,
        name: a?.profile?.fullName ?? "Mitra",
        category: a?.category?.name ?? "Mitra",
        avatar: a?.profilePhotoUrl || a?.profile?.avatarUrl || null,
        amount: toNum(w.amount) * 1000,
        at: w.createdAt,
      };
    });

  const weekAgo = Date.now() - 7 * 86400000;
  const weekPays = pays.filter((p) => new Date(p.createdAt).getTime() >= weekAgo);
  const weekly = {
    total: weekPays.length,
    released: weekPays.filter((p) => p.status === "released").length,
    held: weekPays.filter((p) => p.status === "held" || p.status === "disputed").length,
    volume: weekPays.reduce((s, p) => s + toNum(p.amount), 0),
  };

  sendList(res, data, {
    total: data.length,
    counts,
    escrowHeld,
    heldCount,
    withdrawalRequests,
    weekly,
  });
}

// GET /api/admin/notifications — hal yang perlu ditindak admin.
export async function getAdminNotifications(_req: Request, res: Response): Promise<void> {
  const [apps, disp, wds, reps] = await Promise.all([
    db.query.workerApplications.findMany({ with: { profile: true, category: true } }),
    db.select().from(disputes).orderBy(desc(disputes.createdAt)),
    db.select().from(withdrawals).orderBy(desc(withdrawals.createdAt)),
    db.select().from(reports).orderBy(desc(reports.createdAt)),
  ]);

  const items: Array<Record<string, unknown>> = [];
  const submitted = apps.filter((a) => a.status === "submitted");
  for (const a of submitted)
    items.push({
      id: `verif-${a.id}`,
      type: "verify",
      title: "Mitra menunggu verifikasi",
      body: `${a.profile?.fullName ?? "Mitra"} (${a.category?.name ?? "mitra"})`,
      at: a.createdAt,
      link: "/admin/verifikasi",
    });
  for (const d of disp.filter((x) => x.status !== "resolved"))
    items.push({
      id: `disp-${d.id}`,
      type: "dispute",
      title: "Sengketa perlu ditinjau",
      body: `${d.code} - ${d.jobTitle ?? ""}`,
      at: d.createdAt,
      link: "/admin/sengketa",
    });
  const appName = new Map(apps.map((a) => [a.id, a.profile?.fullName ?? "Mitra"]));
  for (const w of wds.filter((x) => x.status === "requested"))
    items.push({
      id: `wd-${w.id}`,
      type: "withdraw",
      title: "Permintaan pencairan",
      body: `${appName.get(w.workerApplicationId) ?? "Mitra"} - Rp${(toNum(w.amount) * 1000).toLocaleString("id-ID")}`,
      at: w.createdAt,
      link: "/admin/transaksi",
    });
  for (const r of reps.filter((x) => x.status === "open"))
    items.push({
      id: `rep-${r.id}`,
      type: "report",
      title: "Laporan pengguna baru",
      body: `${r.reporterName ?? "Pengguna"}: ${r.subject ?? ""}`,
      at: r.createdAt,
      link: "/admin/laporan",
    });

  items.sort((a, b) => new Date(b["at"] as string).getTime() - new Date(a["at"] as string).getTime());
  sendSuccess(res, { items: items.slice(0, 30), unreadCount: items.length });
}

// PATCH /api/admin/withdrawals/:id/process — tandai pencairan selesai (dibayar).
export async function processWithdrawal(req: Request, res: Response): Promise<void> {
  const id = req.params["id"] as string;
  const [updated] = await db
    .update(withdrawals)
    .set({ status: "paid" })
    .where(eq(withdrawals.id, id))
    .returning();
  if (!updated) throw new NotFoundError("Permintaan pencairan tidak ditemukan");
  sendSuccess(res, { status: updated.status }, { message: "Pencairan diproses" });
}
