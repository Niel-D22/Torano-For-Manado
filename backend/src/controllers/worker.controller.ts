import type { Request, Response } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../config/database.js";
import {
  profiles,
  workerApplications,
  workerReferences,
  workerPortfolios,
  payoutAccounts,
  reviews,
  bookings,
  withdrawals,
  payments,
} from "../db/schema/index.js";
import { sendSuccess, sendList } from "../shared/http/index.js";
import { AppError, NotFoundError } from "../shared/errors/index.js";
import type {
  UpdateApplicationInput,
  ReferenceInput,
  PayoutInput,
  PortfolioInput,
} from "../validators/worker.validator.js";

type AppInsert = typeof workerApplications.$inferInsert;

// Ambil (atau buat draft) pendaftaran milik pekerja yang sedang login.
async function getOrCreateApp(profileId: string) {
  const existing = await db.query.workerApplications.findFirst({
    where: eq(workerApplications.profileId, profileId),
  });
  if (existing) return existing;
  const [created] = await db
    .insert(workerApplications)
    .values({ profileId, status: "draft" })
    .returning();
  return created;
}

// GET /api/worker/me — profil + pendaftaran (beserta relasi) milik sendiri.
export async function getMe(req: Request, res: Response): Promise<void> {
  const application = await db.query.workerApplications.findFirst({
    where: eq(workerApplications.profileId, req.profile!.id),
    with: {
      category: true,
      references: true,
      portfolios: true,
      payoutAccounts: true,
    },
  });
  sendSuccess(res, { profile: req.profile, application: application ?? null });
}

const toNum = (v: unknown) => Number(v ?? 0);

// PATCH /api/worker/me/availability — pekerja mengatur status "open to work".
export async function setAvailability(req: Request, res: Response): Promise<void> {
  const app = await db.query.workerApplications.findFirst({
    where: eq(workerApplications.profileId, req.profile!.id),
  });
  if (!app) throw new NotFoundError("Data pekerja tidak ditemukan");
  const { online } = req.body as { online: boolean };
  const [updated] = await db
    .update(workerApplications)
    .set({ isOnline: Boolean(online) })
    .where(eq(workerApplications.id, app.id))
    .returning();
  sendSuccess(res, { isOnline: updated?.isOnline ?? false });
}

// GET /api/worker/me/dashboard — ringkasan Beranda (statistik + permintaan + jadwal hari ini).
export async function getDashboard(req: Request, res: Response): Promise<void> {
  const profile = req.profile!;
  const app = await db.query.workerApplications.findFirst({
    where: eq(workerApplications.profileId, profile.id),
  });
  if (!app) {
    sendSuccess(res, {
      profile,
      stats: { balance: 0, weeklyEarning: 0, weeklyJobs: 0, jobsCompleted: 0, rating: null, reviewCount: 0, completionRate: null, status: "draft" },
      incoming: [],
      today: [],
    });
    return;
  }

  const [allBookings, allReviews, wds] = await Promise.all([
    db.select().from(bookings).where(eq(bookings.workerApplicationId, app.id)),
    db.select().from(reviews).where(eq(reviews.workerApplicationId, app.id)),
    db.select().from(withdrawals).where(eq(withdrawals.workerApplicationId, app.id)),
  ]);

  const completed = allBookings.filter((b) => b.status === "completed");
  const withdrawn = wds.reduce((s, w) => s + toNum(w.amount), 0);
  const weekAgo = Date.now() - 7 * 86400000;
  const weekly = completed.filter((b) => new Date(b.createdAt).getTime() >= weekAgo);
  const rating =
    allReviews.length > 0
      ? Number((allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1))
      : app.ratingAvg
        ? Number(app.ratingAvg)
        : null;

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const today = allBookings.filter(
    (b) =>
      b.scheduledAt &&
      new Date(b.scheduledAt) >= start &&
      new Date(b.scheduledAt) <= end &&
      b.status !== "completed" &&
      b.status !== "declined",
  );

  sendSuccess(res, {
    profile,
    stats: {
      balance: completed.reduce((s, b) => s + toNum(b.price), 0) - withdrawn,
      weeklyEarning: weekly.reduce((s, b) => s + toNum(b.price), 0),
      weeklyJobs: weekly.length,
      jobsCompleted: app.jobsCompleted ?? completed.length,
      rating,
      reviewCount: allReviews.length,
      completionRate: app.completionRate ?? null,
      status: app.status,
    },
    incoming: allBookings.filter((b) => b.status === "new"),
    today,
  });
}

// GET /api/worker/me/bookings — semua pesanan (Jadwal).
export async function getBookings(req: Request, res: Response): Promise<void> {
  const app = await db.query.workerApplications.findFirst({
    where: eq(workerApplications.profileId, req.profile!.id),
  });
  if (!app) {
    sendList(res, [], { total: 0 });
    return;
  }
  const items = await db
    .select()
    .from(bookings)
    .where(eq(bookings.workerApplicationId, app.id))
    .orderBy(desc(bookings.scheduledAt), desc(bookings.createdAt));
  sendList(res, items, { total: items.length });
}

// PATCH /api/worker/me/bookings/:id/status — terima/tolak/selesaikan.
export async function updateBookingStatus(req: Request, res: Response): Promise<void> {
  const app = await db.query.workerApplications.findFirst({
    where: eq(workerApplications.profileId, req.profile!.id),
  });
  if (!app) throw new NotFoundError("Data tidak ditemukan");
  const { status } = req.body as { status: string };
  const [updated] = await db
    .update(bookings)
    .set({ status })
    .where(and(eq(bookings.id, req.params["id"] as string), eq(bookings.workerApplicationId, app.id)))
    .returning();
  if (!updated) throw new NotFoundError("Pesanan tidak ditemukan");
  sendSuccess(res, { booking: updated });
}

// GET /api/worker/me/reviews — ulasan + ringkasan (rata-rata, jumlah, distribusi).
export async function getReviews(req: Request, res: Response): Promise<void> {
  const app = await db.query.workerApplications.findFirst({
    where: eq(workerApplications.profileId, req.profile!.id),
  });
  if (!app) {
    sendSuccess(res, {
      summary: { avg: null, count: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
      items: [],
    });
    return;
  }
  const items = await db
    .select()
    .from(reviews)
    .where(eq(reviews.workerApplicationId, app.id))
    .orderBy(desc(reviews.createdAt));
  const count = items.length;
  const avg = count > 0 ? Number((items.reduce((s, r) => s + r.rating, 0) / count).toFixed(1)) : null;
  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  items.forEach((r) => {
    distribution[r.rating] = (distribution[r.rating] ?? 0) + 1;
  });
  sendSuccess(res, { summary: { avg, count, distribution }, items });
}

// GET /api/worker/me/earnings — Penghasilan: saldo, ringkasan, riwayat, rekening.
export async function getEarnings(req: Request, res: Response): Promise<void> {
  const app = await db.query.workerApplications.findFirst({
    where: eq(workerApplications.profileId, req.profile!.id),
    with: { payoutAccounts: true },
  });
  if (!app) {
    sendSuccess(res, {
      balance: 0,
      totalEarned: 0,
      thisWeek: 0,
      thisMonth: 0,
      transactions: [],
      payoutAccounts: [],
    });
    return;
  }

  const [completed, wds, released] = await Promise.all([
    db
      .select()
      .from(bookings)
      .where(and(eq(bookings.workerApplicationId, app.id), eq(bookings.status, "completed"))),
    db.select().from(withdrawals).where(eq(withdrawals.workerApplicationId, app.id)),
    db
      .select()
      .from(payments)
      .where(and(eq(payments.workerProfileId, req.profile!.id), eq(payments.status, "released"))),
  ]);

  // Kredit dari booking (satuan ribuan) + dari escrow yang dilepas (rupiah penuh,
  // dikonversi ke ribuan agar seragam dengan tampilan lain).
  const completedCredits = completed.map((b) => ({
    id: `c-${b.id}`,
    type: "credit" as const,
    title: b.jobTitle,
    sub: b.customerName,
    amount: toNum(b.price),
    date: b.createdAt as Date | string,
    status: "Selesai",
  }));
  const releasedCredits = released.map((p) => ({
    id: `p-${p.id}`,
    type: "credit" as const,
    title: "Pembayaran pekerjaan",
    sub: "Escrow Torano",
    amount: Math.round(toNum(p.workerAmount) / 1000),
    date: (p.releasedAt ?? p.createdAt) as Date | string,
    status: "Diterima",
  }));
  const credits = [...completedCredits, ...releasedCredits];

  const totalEarned = credits.reduce((s, c) => s + c.amount, 0);
  const totalWithdrawn = wds.reduce((s, w) => s + toNum(w.amount), 0);
  const now = Date.now();
  const inRange = (d: Date | string, ms: number) => new Date(d).getTime() >= now - ms;
  const thisWeek = credits
    .filter((c) => inRange(c.date, 7 * 86400000))
    .reduce((s, c) => s + c.amount, 0);
  const thisMonth = credits
    .filter((c) => inRange(c.date, 30 * 86400000))
    .reduce((s, c) => s + c.amount, 0);

  const transactions = [
    ...credits,
    ...wds.map((w) => ({
      id: `w-${w.id}`,
      type: "debit" as const,
      title: "Penarikan dana",
      sub: null,
      amount: toNum(w.amount),
      date: w.createdAt as Date | string,
      status: w.status,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  sendSuccess(res, {
    balance: totalEarned - totalWithdrawn,
    totalEarned,
    thisWeek,
    thisMonth,
    transactions,
    payoutAccounts: app.payoutAccounts,
  });
}

// POST /api/worker/me/withdrawals — tarik saldo ke rekening/e-wallet.
export async function createWithdrawal(req: Request, res: Response): Promise<void> {
  const app = await db.query.workerApplications.findFirst({
    where: eq(workerApplications.profileId, req.profile!.id),
  });
  if (!app) throw new NotFoundError("Data tidak ditemukan");

  const { amount, payoutAccountId } = req.body as {
    amount: number;
    payoutAccountId?: string;
  };

  const [completed, wds] = await Promise.all([
    db
      .select()
      .from(bookings)
      .where(and(eq(bookings.workerApplicationId, app.id), eq(bookings.status, "completed"))),
    db.select().from(withdrawals).where(eq(withdrawals.workerApplicationId, app.id)),
  ]);
  const balance =
    completed.reduce((s, b) => s + toNum(b.price), 0) -
    wds.reduce((s, w) => s + toNum(w.amount), 0);

  if (amount > balance) {
    throw new AppError("Saldo tidak mencukupi", 400, "VALIDATION_ERROR");
  }

  const [w] = await db
    .insert(withdrawals)
    .values({
      workerApplicationId: app.id,
      payoutAccountId: payoutAccountId ?? null,
      amount: String(amount),
      status: "paid",
    })
    .returning();

  sendSuccess(res, { withdrawal: w }, { message: "Penarikan berhasil diproses" });
}

// PATCH /api/worker/me/application — simpan sebagian data (draft).
export async function updateApplication(
  req: Request,
  res: Response,
): Promise<void> {
  const app = await getOrCreateApp(req.profile!.id);
  if (!app) throw new AppError("Gagal menyiapkan data", 500, "DATABASE_ERROR");

  const b = req.body as UpdateApplicationInput;
  const set: Partial<AppInsert> = { updatedAt: new Date() };
  if (b.categoryId !== undefined) set.categoryId = b.categoryId;
  if (b.nik !== undefined) set.nik = b.nik;
  if (b.skillDescription !== undefined) set.skillDescription = b.skillDescription;
  if (b.dateOfBirth !== undefined) set.dateOfBirth = b.dateOfBirth;
  if (b.experienceYears !== undefined) set.experienceYears = b.experienceYears;
  if (b.skills !== undefined) set.skills = b.skills;
  if (b.serviceAreas !== undefined) set.serviceAreas = b.serviceAreas;
  if (b.fixedRate !== undefined) set.fixedRate = String(b.fixedRate);
  if (b.rateMax !== undefined) set.rateMax = String(b.rateMax);
  if (b.latitude !== undefined) set.latitude = String(b.latitude);
  if (b.longitude !== undefined) set.longitude = String(b.longitude);
  if (b.radiusKm !== undefined) set.radiusKm = b.radiusKm;
  if (b.workingHours !== undefined) set.workingHours = b.workingHours;
  if (b.profilePhotoUrl !== undefined) set.profilePhotoUrl = b.profilePhotoUrl;
  if (b.selfiePhotoUrl !== undefined) set.selfiePhotoUrl = b.selfiePhotoUrl;

  const [updated] = await db
    .update(workerApplications)
    .set(set)
    .where(eq(workerApplications.id, app.id))
    .returning();

  // Sinkron foto profil ke profiles.avatarUrl agar navbar ikut ter-update.
  if (b.profilePhotoUrl !== undefined) {
    await db
      .update(profiles)
      .set({ avatarUrl: b.profilePhotoUrl, updatedAt: new Date() })
      .where(eq(profiles.id, req.profile!.id));
  }

  sendSuccess(res, { application: updated }, { message: "Tersimpan" });
}

// POST /api/worker/me/application/submit — kirim untuk diverifikasi admin.
export async function submitApplication(
  req: Request,
  res: Response,
): Promise<void> {
  const app = await db.query.workerApplications.findFirst({
    where: eq(workerApplications.profileId, req.profile!.id),
    with: { references: true },
  });
  if (!app) throw new NotFoundError("Belum ada data pendaftaran");

  const missing: string[] = [];
  if (!app.categoryId) missing.push("kategori");
  if (!app.skills || app.skills.length === 0) missing.push("keahlian");
  if (!app.fixedRate) missing.push("tarif");
  if (!app.serviceAreas || app.serviceAreas.length === 0) missing.push("area kerja");
  if (!app.latitude || !app.longitude) missing.push("titik lokasi di peta");
  if (!app.selfiePhotoUrl) missing.push("foto verifikasi");
  if (!app.references || app.references.length === 0) missing.push("referensi komunitas");
  if (missing.length > 0) {
    throw new AppError(
      `Lengkapi dulu: ${missing.join(", ")}`,
      400,
      "VALIDATION_ERROR",
      { details: { missing } },
    );
  }

  const [updated] = await db
    .update(workerApplications)
    .set({ status: "submitted", rejectionReason: null, updatedAt: new Date() })
    .where(eq(workerApplications.id, app.id))
    .returning();

  sendSuccess(res, { application: updated }, { message: "Terkirim untuk verifikasi" });
}

// POST /api/worker/me/references
export async function addReference(req: Request, res: Response): Promise<void> {
  const app = await getOrCreateApp(req.profile!.id);
  if (!app) throw new AppError("Gagal menyiapkan data", 500, "DATABASE_ERROR");
  const b = req.body as ReferenceInput;
  const [ref] = await db
    .insert(workerReferences)
    .values({ workerApplicationId: app.id, ...b })
    .returning();
  sendSuccess(res, { reference: ref }, { statusCode: 201 });
}

// DELETE /api/worker/me/references/:id
export async function deleteReference(
  req: Request,
  res: Response,
): Promise<void> {
  const app = await db.query.workerApplications.findFirst({
    where: eq(workerApplications.profileId, req.profile!.id),
  });
  if (!app) throw new NotFoundError("Data tidak ditemukan");
  await db
    .delete(workerReferences)
    .where(
      and(
        eq(workerReferences.id, req.params["id"] as string),
        eq(workerReferences.workerApplicationId, app.id),
      ),
    );
  sendSuccess(res, { ok: true });
}

// POST /api/worker/me/portfolios
export async function addPortfolio(req: Request, res: Response): Promise<void> {
  const app = await getOrCreateApp(req.profile!.id);
  if (!app) throw new AppError("Gagal menyiapkan data", 500, "DATABASE_ERROR");
  const b = req.body as PortfolioInput;
  const [item] = await db
    .insert(workerPortfolios)
    .values({
      workerApplicationId: app.id,
      imageUrl: b.imageUrl,
      title: b.title ?? "Portofolio",
      description: b.description ?? null,
    })
    .returning();
  sendSuccess(res, { portfolio: item }, { statusCode: 201 });
}

// DELETE /api/worker/me/portfolios/:id
export async function deletePortfolio(
  req: Request,
  res: Response,
): Promise<void> {
  const app = await db.query.workerApplications.findFirst({
    where: eq(workerApplications.profileId, req.profile!.id),
  });
  if (!app) throw new NotFoundError("Data tidak ditemukan");
  await db
    .delete(workerPortfolios)
    .where(
      and(
        eq(workerPortfolios.id, req.params["id"] as string),
        eq(workerPortfolios.workerApplicationId, app.id),
      ),
    );
  sendSuccess(res, { ok: true });
}

// POST /api/worker/me/payout-accounts
export async function addPayout(req: Request, res: Response): Promise<void> {
  const app = await getOrCreateApp(req.profile!.id);
  if (!app) throw new AppError("Gagal menyiapkan data", 500, "DATABASE_ERROR");
  const b = req.body as PayoutInput;
  // Jika ditandai utama, lepas status utama dari yang lain.
  if (b.isPrimary) {
    await db
      .update(payoutAccounts)
      .set({ isPrimary: false })
      .where(eq(payoutAccounts.workerApplicationId, app.id));
  }
  const [acc] = await db
    .insert(payoutAccounts)
    .values({ workerApplicationId: app.id, ...b })
    .returning();
  sendSuccess(res, { payoutAccount: acc }, { statusCode: 201 });
}

// DELETE /api/worker/me/payout-accounts/:id
export async function deletePayout(req: Request, res: Response): Promise<void> {
  const app = await db.query.workerApplications.findFirst({
    where: eq(workerApplications.profileId, req.profile!.id),
  });
  if (!app) throw new NotFoundError("Data tidak ditemukan");
  await db
    .delete(payoutAccounts)
    .where(
      and(
        eq(payoutAccounts.id, req.params["id"] as string),
        eq(payoutAccounts.workerApplicationId, app.id),
      ),
    );
  sendSuccess(res, { ok: true });
}
