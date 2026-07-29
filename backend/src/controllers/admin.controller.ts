import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../config/database.js";
import {
  workerApplications,
  workerReferences,
} from "../db/schema/index.js";
import { sendSuccess, sendList } from "../shared/http/index.js";
import { NotFoundError } from "../shared/errors/index.js";
import type {
  RejectInput,
  UpdateReferenceInput,
} from "../validators/admin.validator.js";

/**
 * GET /api/admin/worker-applications?status=submitted
 * Daftar ringkas untuk antrean "Menunggu verifikasi".
 */
export async function listApplications(
  req: Request,
  res: Response,
): Promise<void> {
  const status =
    typeof req.query["status"] === "string" ? req.query["status"] : "submitted";

  const apps = await db.query.workerApplications.findMany({
    where: eq(workerApplications.status, status),
    with: { profile: true, category: true },
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });

  const data = apps.map((a) => ({
    id: a.id,
    name: a.profile.fullName,
    avatarUrl: a.profile.avatarUrl,
    category: a.category.name,
    area: a.serviceAreas?.[0] ?? null,
    status: a.status,
    submittedAt: a.createdAt,
  }));

  sendList(res, data, { total: data.length, status });
}

/**
 * GET /api/admin/worker-applications/:id — detail lengkap untuk panel kanan.
 */
export async function getApplication(
  req: Request,
  res: Response,
): Promise<void> {
  const app = await db.query.workerApplications.findFirst({
    where: eq(workerApplications.id, req.params["id"] as string),
    with: {
      profile: true,
      category: true,
      references: true,
      portfolios: true,
    },
  });

  if (!app) {
    throw new NotFoundError("Pendaftaran tidak ditemukan");
  }

  sendSuccess(res, { application: app });
}

/**
 * PATCH /api/admin/worker-applications/:id/approve — setujui mitra.
 */
export async function approveApplication(
  req: Request,
  res: Response,
): Promise<void> {
  const [updated] = await db
    .update(workerApplications)
    .set({
      status: "verified",
      reviewedBy: req.profile?.id ?? null,
      reviewedAt: new Date(),
      rejectionReason: null,
      updatedAt: new Date(),
    })
    .where(eq(workerApplications.id, req.params["id"] as string))
    .returning();

  if (!updated) {
    throw new NotFoundError("Pendaftaran tidak ditemukan");
  }

  sendSuccess(res, { application: updated }, { message: "Mitra disetujui" });
}

/**
 * PATCH /api/admin/worker-applications/:id/reject — tolak dengan alasan.
 */
export async function rejectApplication(
  req: Request,
  res: Response,
): Promise<void> {
  const { reason } = req.body as RejectInput;

  const [updated] = await db
    .update(workerApplications)
    .set({
      status: "rejected",
      rejectionReason: reason,
      reviewedBy: req.profile?.id ?? null,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(workerApplications.id, req.params["id"] as string))
    .returning();

  if (!updated) {
    throw new NotFoundError("Pendaftaran tidak ditemukan");
  }

  sendSuccess(res, { application: updated }, { message: "Pendaftaran ditolak" });
}

/**
 * PATCH /api/admin/references/:id — tandai referensi sudah dihubungi + catatan.
 */
export async function updateReference(
  req: Request,
  res: Response,
): Promise<void> {
  const { contacted, adminNote } = req.body as UpdateReferenceInput;

  const set: { contacted?: boolean; adminNote?: string; updatedAt: Date } = {
    updatedAt: new Date(),
  };
  if (contacted !== undefined) set.contacted = contacted;
  if (adminNote !== undefined) set.adminNote = adminNote;

  const [updated] = await db
    .update(workerReferences)
    .set(set)
    .where(eq(workerReferences.id, req.params["id"] as string))
    .returning();

  if (!updated) {
    throw new NotFoundError("Referensi tidak ditemukan");
  }

  sendSuccess(res, { reference: updated });
}
