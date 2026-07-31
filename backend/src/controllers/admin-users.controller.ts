import type { Request, Response } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../config/database.js";
import {
  profiles,
  workerApplications,
  bookings,
  reviews,
  payments,
} from "../db/schema/index.js";
import { sendSuccess, sendList } from "../shared/http/index.js";
import { NotFoundError } from "../shared/errors/index.js";

const toNum = (v: unknown) => Number(v ?? 0);

// ID mitra bergaya "MIT-YYMMDD-XXXX" dari tanggal daftar + potongan uuid.
const mitraId = (createdAt: Date | string | null, id: string) => {
  const d = createdAt ? new Date(createdAt) : new Date();
  const ymd =
    String(d.getFullYear()).slice(2) +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0");
  const tail = id.replace(/\D/g, "").slice(0, 4).padStart(4, "0");
  return `MIT-${ymd}-${tail}`;
};

const maskPhone = (phone: string | null) => {
  if (!phone) return null;
  const digits = phone.replace(/\s/g, "");
  if (digits.length < 8) return phone;
  return digits.slice(0, 6) + "-****-" + digits.slice(-4);
};

const STATUSES = new Set(["active", "suspended", "blocked"]);

// GET /api/admin/users?tab=mitra|pelanggan&q=&status=&category=&area=
export async function listUsers(req: Request, res: Response): Promise<void> {
  const tab = req.query["tab"] === "pelanggan" ? "pelanggan" : "mitra";
  const q = String(req.query["q"] ?? "").trim().toLowerCase();
  const status = String(req.query["status"] ?? "").trim();
  const category = String(req.query["category"] ?? "").trim();
  const area = String(req.query["area"] ?? "").trim();

  if (tab === "pelanggan") {
    const rows = await db.query.profiles.findMany({
      where: eq(profiles.role, "customer"),
      orderBy: (t, { desc: d }) => [d(t.createdAt)],
    });
    let data = rows.map((p) => ({
      id: p.id,
      profileId: p.id,
      name: p.fullName,
      avatar: p.avatarUrl,
      phone: maskPhone(p.phone),
      email: p.email,
      area: null as string | null,
      joined: p.createdAt,
      status: p.accountStatus ?? "active",
    }));
    if (q) data = data.filter((r) => `${r.name} ${r.phone ?? ""} ${r.email ?? ""}`.toLowerCase().includes(q));
    if (STATUSES.has(status)) data = data.filter((r) => r.status === status);
    sendList(res, data, { total: data.length });
    return;
  }

  const apps = await db.query.workerApplications.findMany({
    with: { profile: true, category: true },
    orderBy: (t, { desc: d }) => [d(t.createdAt)],
  });
  let data = apps.map((a) => ({
    id: a.id,
    profileId: a.profileId,
    name: a.profile?.fullName ?? "Mitra",
    avatar: a.profilePhotoUrl || a.profile?.avatarUrl || null,
    category: a.category?.name ?? "Mitra",
    categorySlug: a.category?.slug ?? null,
    phone: maskPhone(a.profile?.phone ?? null),
    area: a.serviceAreas?.[0] ?? null,
    joined: a.profile?.createdAt ?? a.createdAt,
    jobs: a.jobsCompleted ?? 0,
    rating: a.ratingAvg != null ? Number(a.ratingAvg) : null,
    verification: a.status, // draft|submitted|verified|rejected
    status: a.profile?.accountStatus ?? "active",
    idMitra: mitraId(a.profile?.createdAt ?? a.createdAt, a.id),
  }));
  if (q) data = data.filter((r) => `${r.name} ${r.phone ?? ""} ${r.idMitra}`.toLowerCase().includes(q));
  if (STATUSES.has(status)) data = data.filter((r) => r.status === status);
  if (category) data = data.filter((r) => r.categorySlug === category);
  if (area) data = data.filter((r) => (r.area ?? "").toLowerCase() === area.toLowerCase());
  sendList(res, data, { total: data.length });
}

// GET /api/admin/users/:id/detail — detail mitra untuk panel kanan.
export async function getUserDetail(req: Request, res: Response): Promise<void> {
  const id = req.params["id"] as string;
  const a = await db.query.workerApplications.findFirst({
    where: eq(workerApplications.id, id),
    with: { profile: true, category: true, references: true, payoutAccounts: true },
  });
  if (!a || !a.profile) throw new NotFoundError("Mitra tidak ditemukan");

  const [bks, rvs, pays] = await Promise.all([
    db
      .select()
      .from(bookings)
      .where(eq(bookings.workerApplicationId, a.id))
      .orderBy(desc(bookings.createdAt)),
    db
      .select()
      .from(reviews)
      .where(eq(reviews.workerApplicationId, a.id))
      .orderBy(desc(reviews.createdAt)),
    db
      .select()
      .from(payments)
      .where(and(eq(payments.workerProfileId, a.profileId), eq(payments.status, "released"))),
  ]);

  const completed = bks.filter((b) => b.status === "completed");
  const totalEarned =
    completed.reduce((s, b) => s + toNum(b.price) * 1000, 0) +
    pays.reduce((s, p) => s + toNum(p.workerAmount), 0);

  const at = a.reviewedAt;
  const verification = [
    { label: "Verifikasi wajah", done: Boolean(a.selfiePhotoUrl), at },
    { label: "Referensi komunitas", done: (a.references?.length ?? 0) > 0, at },
    { label: "Data diri", done: Boolean(a.nik || a.dateOfBirth), at },
    { label: "Rekening bank", done: (a.payoutAccounts?.length ?? 0) > 0, at },
  ];

  // Timeline aktivitas dari data nyata (pekerjaan selesai, dana dilepas, gabung).
  const activity: Array<{ kind: string; title: string; sub: string | null; at: Date | string }> = [];
  for (const b of completed.slice(0, 3))
    activity.push({ kind: "job", title: "Pekerjaan diselesaikan", sub: b.jobTitle, at: b.createdAt });
  for (const p of pays.slice(0, 3))
    activity.push({
      kind: "payout",
      title: "Dana dilepas",
      sub: `Rp${toNum(p.workerAmount).toLocaleString("id-ID")} ke saldo mitra`,
      at: p.releasedAt ?? p.createdAt,
    });
  activity.push({ kind: "join", title: "Mitra bergabung", sub: "Akun berhasil dibuat", at: a.profile.createdAt });
  activity.sort((x, y) => new Date(y.at).getTime() - new Date(x.at).getTime());

  sendSuccess(res, {
    user: {
      id: a.id,
      profileId: a.profileId,
      name: a.profile.fullName,
      avatar: a.profilePhotoUrl || a.profile.avatarUrl || null,
      category: a.category?.name ?? "Mitra",
      area: a.serviceAreas?.[0] ?? null,
      phone: a.profile.phone,
      email: a.profile.email,
      idMitra: mitraId(a.profile.createdAt ?? a.createdAt, a.id),
      status: a.profile.accountStatus ?? "active",
      verification: a.status,
      verifiedAt: a.reviewedAt,
      checklist: verification,
      stats: {
        jobsCompleted: a.jobsCompleted ?? completed.length,
        rating: a.ratingAvg != null ? Number(a.ratingAvg) : null,
        completionRate: a.completionRate ?? null,
        totalEarned,
      },
      recentJobs: bks.slice(0, 3).map((b) => ({
        id: b.id,
        title: b.jobTitle,
        date: b.scheduledAt ?? b.createdAt,
        price: toNum(b.price) * 1000,
        status: b.status,
      })),
      recentReviews: rvs.slice(0, 2).map((r) => ({
        id: r.id,
        name: r.reviewerName,
        avatar: r.reviewerAvatar,
        rating: r.rating,
        comment: r.comment,
        job: r.jobTitle,
        date: r.createdAt,
      })),
      activity: activity.slice(0, 5),
    },
  });
}

// PATCH /api/admin/users/:profileId/status { status: active|suspended|blocked }
export async function setUserStatus(req: Request, res: Response): Promise<void> {
  const profileId = req.params["profileId"] as string;
  const { status } = req.body as { status: string };
  if (!STATUSES.has(status)) throw new NotFoundError("Status tidak valid");
  const [updated] = await db
    .update(profiles)
    .set({ accountStatus: status })
    .where(eq(profiles.id, profileId))
    .returning();
  if (!updated) throw new NotFoundError("Pengguna tidak ditemukan");
  sendSuccess(res, { status: updated.accountStatus });
}
