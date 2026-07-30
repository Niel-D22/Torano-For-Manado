import express from "express";
import { eq } from "drizzle-orm";
import { db } from "../config/database.js";
import { workerApplications } from "../db/schema/index.js";
import { sendList, sendSuccess } from "../shared/http/index.js";
import { NotFoundError } from "../shared/errors/index.js";

// Pusat Manado untuk estimasi jarak (pencari belum berbagi lokasi presisi).
const MANADO = { lat: 1.4748, lng: 124.8421 };
const haversine = (aLat: number, aLng: number, bLat: number, bLng: number) => {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toCard = (a: any) => {
  const lat = a.latitude != null ? Number(a.latitude) : null;
  const lng = a.longitude != null ? Number(a.longitude) : null;
  const ref = a.references?.[0];
  return {
    id: a.id,
    profileId: a.profileId,
    name: a.profile?.fullName ?? "Pekerja",
    photo: a.profilePhotoUrl || a.profile?.avatarUrl || null,
    category: a.category?.slug ?? null,
    categoryName: a.category?.name ?? null,
    skill: a.skills?.[0] || a.skillDescription || "",
    about: a.skillDescription ?? null,
    area: a.serviceAreas?.[0] ?? null,
    serviceAreas: a.serviceAreas ?? [],
    skills: a.skills ?? [],
    lat,
    lng,
    distanceKm:
      lat != null && lng != null
        ? Math.round(haversine(MANADO.lat, MANADO.lng, lat, lng) * 10) / 10
        : 0,
    rating: a.ratingAvg != null ? Number(a.ratingAvg) : null,
    jobs: a.jobsCompleted ?? 0,
    priceMin: a.fixedRate != null ? Number(a.fixedRate) : null,
    priceMax: a.rateMax != null ? Number(a.rateMax) : null,
    trust: ref ? `${ref.name} · ${ref.relationship}` : "Mitra terverifikasi Torano",
    available: true,
    experienceYears: a.experienceYears ?? null,
    references: a.references ?? [],
    portfolios: a.portfolios ?? [],
    phone: a.profile?.phone ?? null,
  };
};

const router = express.Router();

// GET /api/workers — daftar pekerja terverifikasi (publik).
router.get("/", async (_req, res) => {
  const rows = await db.query.workerApplications.findMany({
    where: eq(workerApplications.status, "verified"),
    with: { profile: true, category: true, references: true },
  });
  sendList(res, rows.map(toCard), { total: rows.length });
});

// GET /api/workers/:id — detail publik satu pekerja terverifikasi.
router.get("/:id", async (req, res) => {
  const a = await db.query.workerApplications.findFirst({
    where: eq(workerApplications.id, req.params["id"] as string),
    with: { profile: true, category: true, references: true, portfolios: true },
  });
  if (!a || a.status !== "verified") {
    throw new NotFoundError("Pekerja tidak ditemukan");
  }
  sendSuccess(res, { worker: toCard(a) });
});

export default router;
