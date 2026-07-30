import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import * as schema from "./schema/index.js";
import { categories } from "./schema/categories.js";
import { profiles } from "./schema/profiles.js";
import { workerApplications } from "./schema/worker-applications.js";
import { workerReferences } from "./schema/worker-references.js";

// Pendaftaran pekerja contoh berstatus "submitted" agar halaman Verifikasi
// Mitra (admin) punya data nyata untuk ditinjau. authUserId dibuat tetap agar
// seed bersifat idempoten (bisa dijalankan berulang tanpa menduplikasi).
const SAMPLE = [
  {
    authUserId: "11111111-1111-4111-8111-111111111111",
    fullName: "Ventje Tumbelaka",
    phone: "+62 812-3456-7890",
    photo: "https://i.pravatar.cc/400?img=12",
    categorySlug: "tukang",
    dateOfBirth: "1988-03-12",
    experienceYears: 5,
    about:
      "Berpengalaman dalam pekerjaan bangunan, beton, pasang keramik, cat, dan perbaikan rumah.",
    skills: ["Pasang Keramik", "Pengecoran", "Plester & Acian", "Pengecatan", "Perbaikan Rumah"],
    areas: ["Wanea", "Paal Dua", "Malalayang", "Sario", "Tuminting"],
    rateMin: 90,
    rateMax: 150,
    reference: { name: "Bpk. Jhon Lumentut", relationship: "Ketua RT 03", phone: "+62 821-9876-5432" },
    lat: 1.478, lng: 124.836, rating: 4.9, jobs: 132, completion: 98, status: "verified",
  },
  {
    authUserId: "22222222-2222-4222-8222-222222222222",
    fullName: "Ricky Makalalag",
    phone: "+62 813-2211-3344",
    photo: "https://i.pravatar.cc/400?img=32",
    categorySlug: "art",
    dateOfBirth: "1995-07-02",
    experienceYears: 3,
    about: "Teliti dan rapi untuk bersih rumah harian, setrika, dan bongkar besar.",
    skills: ["Bersih Rumah", "Setrika", "Cuci Piring", "Rapikan Kamar"],
    areas: ["Paal Dua", "Wenang", "Sario"],
    rateMin: 70,
    rateMax: 110,
    reference: { name: "Ibu Sarah Rumagit", relationship: "Tetangga", phone: "+62 852-1122-3344" },
    lat: 1.487, lng: 124.851, rating: 4.8, jobs: 98, completion: 96, status: "verified",
  },
  {
    authUserId: "33333333-3333-4333-8333-333333333333",
    fullName: "Andi Setiawan",
    phone: "+62 811-5566-7788",
    photo: "https://i.pravatar.cc/400?img=15",
    categorySlug: "montir",
    dateOfBirth: "1990-11-20",
    experienceYears: 7,
    about: "Montir panggilan motor & mobil ringan, bawa peralatan sendiri.",
    skills: ["Servis Motor", "Servis Mobil Ringan", "Ganti Oli", "Tune Up"],
    areas: ["Malalayang", "Bahu", "Winangun"],
    rateMin: 100,
    rateMax: 180,
    reference: { name: "Pak Hans Karundeng", relationship: "Pemilik Bengkel", phone: "+62 813-4455-6677" },
    lat: 1.474, lng: 124.807, rating: 4.7, jobs: 76, completion: 94, status: "verified",
  },
  {
    authUserId: "44444444-4444-4444-8444-444444444444",
    fullName: "Maria Lumentut",
    phone: "+62 812-9988-7766",
    photo: "https://i.pravatar.cc/400?img=45",
    categorySlug: "event",
    dateOfBirth: "1993-01-25",
    experienceYears: 4,
    about: "Tim among tamu & katering untuk acara keluarga dan gereja.",
    skills: ["Among Tamu", "Katering", "Dekorasi", "MC Acara"],
    areas: ["Sario", "Wenang", "Tikala"],
    rateMin: 130,
    rateMax: 200,
    reference: { name: "Pdt. Samuel R.", relationship: "Pendeta Jemaat", phone: "+62 821-3322-1100" },
    lat: 1.479, lng: 124.834, rating: 4.9, jobs: 71, completion: 97, status: "verified",
  },
  {
    authUserId: "55555555-5555-4555-8555-555555555555",
    fullName: "Jefry Kaseger",
    phone: "+62 813-7766-5544",
    photo: "https://i.pravatar.cc/400?img=33",
    categorySlug: "tukang",
    dateOfBirth: "1986-09-08",
    experienceYears: 9,
    about: "Tukang las, pagar, teralis, dan besi ringan. Hasil kuat dan rapi.",
    skills: ["Las", "Pasang Teralis", "Besi Ringan", "Perbaikan Pagar"],
    areas: ["Tuminting", "Wenang", "Mapanget"],
    rateMin: 95,
    rateMax: 160,
    reference: { name: "Bpk. Boy Mongdong", relationship: "Ketua RT 02", phone: "+62 852-6677-8899" },
    lat: 1.503, lng: 124.842, rating: 4.6, jobs: 54, completion: 92, status: "submitted",
  },
  {
    authUserId: "66666666-6666-4666-8666-666666666666",
    fullName: "Billy Rompas",
    phone: "+62 811-2233-4455",
    photo: "https://i.pravatar.cc/400?img=51",
    categorySlug: "montir",
    dateOfBirth: "1992-05-14",
    experienceYears: 6,
    about: "Servis AC mobil & kelistrikan ringan di lokasi. Jujur soal biaya.",
    skills: ["AC Mobil", "Kelistrikan", "Aki & Dinamo"],
    areas: ["Wanea", "Malalayang"],
    rateMin: 110,
    rateMax: 190,
    reference: { name: "Vino Manueke", relationship: "Pelanggan tetap", phone: "+62 813-9900-1122" },
    lat: 1.481, lng: 124.838, rating: 4.7, jobs: 88, completion: 95, status: "submitted",
  },
];

async function seedWorkers(): Promise<void> {
  const databaseUrl = process.env["DATABASE_URL"];
  if (!databaseUrl) {
    console.error("DATABASE_URL is required to run the seed script");
    process.exit(1);
  }

  const client = postgres(databaseUrl, { prepare: false });
  const db = drizzle(client, { schema });

  const catRows = await db.select().from(categories);
  const catBySlug = new Map(catRows.map((c) => [c.slug, c.id]));

  console.log("🌱 Seeding pendaftaran pekerja (status: submitted)…");

  for (const w of SAMPLE) {
    const categoryId = catBySlug.get(w.categorySlug);
    if (!categoryId) {
      console.warn(`  ! kategori "${w.categorySlug}" tidak ada, lewati ${w.fullName}`);
      continue;
    }

    // Upsert profil (idempoten via authUserId unik).
    await db
      .insert(profiles)
      .values({
        authUserId: w.authUserId,
        fullName: w.fullName,
        phone: w.phone,
        avatarUrl: w.photo,
        role: "worker",
      })
      .onConflictDoUpdate({
        target: profiles.authUserId,
        set: { fullName: w.fullName, phone: w.phone, avatarUrl: w.photo, role: "worker" },
      });

    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.authUserId, w.authUserId),
    });
    if (!profile) continue;

    // Tulis ulang aplikasi agar seed idempoten.
    await db.delete(workerApplications).where(eq(workerApplications.profileId, profile.id));

    const [app] = await db
      .insert(workerApplications)
      .values({
        profileId: profile.id,
        nik: "1571" + w.authUserId.replace(/\D/g, "").slice(0, 12),
        categoryId,
        skillDescription: w.about,
        dateOfBirth: w.dateOfBirth,
        experienceYears: w.experienceYears,
        skills: w.skills,
        serviceAreas: w.areas,
        fixedRate: String(w.rateMin),
        rateMax: String(w.rateMax),
        latitude: String(w.lat),
        longitude: String(w.lng),
        radiusKm: 5,
        ratingAvg: String(w.rating),
        reviewCount: w.jobs,
        jobsCompleted: w.jobs,
        completionRate: w.completion,
        selfiePhotoUrl: w.photo,
        profilePhotoUrl: w.photo,
        status: w.status,
      })
      .returning();

    if (app) {
      await db.insert(workerReferences).values({
        workerApplicationId: app.id,
        name: w.reference.name,
        relationship: w.reference.relationship,
        phone: w.reference.phone,
      });
    }

    console.log(`  ✓ ${w.fullName} (${w.categorySlug})`);
  }

  console.log("✅ Seed pekerja selesai");
  await client.end();
}

seedWorkers().catch((err) => {
  console.error("❌ Seed pekerja gagal:", err);
  process.exit(1);
});
