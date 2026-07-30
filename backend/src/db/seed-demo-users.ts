import "dotenv/config";
import postgres from "postgres";

// Akun demo tiap peran, dibuat langsung di auth.users (lewat pgcrypto) agar
// lolos validasi domain Supabase, terkonfirmasi, dan bebas rate limit.
// Admin TIDAK di sini (login admin terpisah: username/password backend).
const INSTANCE = "00000000-0000-0000-0000-000000000000";

const DEMOS = [
  {
    id: "a0000000-0000-4000-8000-000000000001",
    email: "pencari@torano.app",
    password: "demo12345",
    name: "Demo Pencari",
    role: "customer",
  },
  {
    id: "a0000000-0000-4000-8000-000000000002",
    email: "pekerja@torano.app",
    password: "demo12345",
    name: "Demo Pekerja",
    role: "worker",
  },
];

async function main(): Promise<void> {
  const databaseUrl = process.env["DATABASE_URL"];
  if (!databaseUrl) {
    console.error("DATABASE_URL wajib diisi");
    process.exit(1);
  }

  const sql = postgres(databaseUrl, { prepare: false });

  console.log("Membuat akun demo...");
  for (const d of DEMOS) {
    // Tulis ulang agar idempoten.
    await sql`delete from auth.users where email = ${d.email}`;
    await sql`delete from profiles where email = ${d.email}`;

    // Kolom token wajib '' (bukan NULL) agar GoTrue tidak error saat login.
    await sql`
      insert into auth.users
        (id, instance_id, aud, role, email, encrypted_password,
         email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
         confirmation_token, recovery_token, email_change,
         email_change_token_new, email_change_token_current,
         phone_change, phone_change_token, reauthentication_token,
         created_at, updated_at)
      values
        (${d.id}, ${INSTANCE}, 'authenticated', 'authenticated', ${d.email},
         crypt(${d.password}, gen_salt('bf')), now(),
         ${sql.json({ provider: "email", providers: ["email"] })},
         ${sql.json({ full_name: d.name, role: d.role })},
         '', '', '', '', '', '', '', '',
         now(), now())`;

    await sql`
      insert into profiles (auth_user_id, full_name, email, role)
      values (${d.id}, ${d.name}, ${d.email}, ${d.role}::user_role)`;

    console.log(`  ${d.email}  |  ${d.password}  |  peran: ${d.role}`);
  }

  // Pendaftaran lengkap (status draft) untuk akun demo pekerja, agar halaman
  // Profil terisi dan alur "kirim untuk verifikasi" bisa didemokan.
  const cat = await sql`select id from categories where slug = 'tukang' limit 1`;
  const prof = await sql`select id from profiles where email = 'pekerja@torano.app' limit 1`;
  if (cat[0] && prof[0]) {
    const pekerjaId = prof[0].id;
    const appId = "b0000000-0000-4000-8000-000000000002";
    const photo = "https://i.pravatar.cc/400?img=68";
    await sql`delete from worker_applications where profile_id = ${pekerjaId}`;
    await sql`
      insert into worker_applications
        (id, profile_id, category_id, nik, skill_description, date_of_birth,
         experience_years, skills, service_areas, fixed_rate, rate_max,
         latitude, longitude, radius_km,
         working_hours, selfie_photo_url, profile_photo_url, rating_avg,
         review_count, jobs_completed, completion_rate, status, created_at, updated_at)
      values
        (${appId}, ${pekerjaId}, ${cat[0].id}, '1571010203040506',
         'Spesialis perbaikan tembok, plafon, pengecatan, dan renovasi ringan.',
         '1990-05-14', 6,
         ${["Tukang Bangunan", "Perbaikan Rumah", "Pengecatan", "Plafon"]}::text[],
         ${["Wanea", "Paal Dua", "Malalayang"]}::text[],
         90, 150,
         1.478000, 124.836000, 5,
         ${sql.json({ days: { sen: true, sel: true, rab: true, kam: true, jum: true, sab: true, min: false }, start: "08:00", end: "18:00" })},
         ${photo}, ${photo}, 4.9, 128, 326, 98, 'verified', now(), now())`;
    // Tandai sudah diverifikasi agar muncul di halaman Cari Pekerja & bisa
    // diuji chat dua arah (login sebagai pekerja@torano.app melihat percakapan).
    await sql`update worker_applications set reviewed_at = now() where id = ${appId}`;
    // Selaraskan foto ke profil agar avatar tampil konsisten.
    await sql`update profiles set avatar_url = ${photo} where id = ${pekerjaId}`;
    await sql`
      insert into worker_references (worker_application_id, name, relationship, phone, contacted)
      values (${appId}, 'Bpk. Jhon Lumentut', 'Ketua RT 03 Wanea', '+62 821-9876-5432', false)`;
    await sql`
      insert into payout_accounts (worker_application_id, type, provider, account_number, account_holder, is_primary)
      values
        (${appId}, 'bank', 'BCA', '8730104521', 'Demo Pekerja', true),
        (${appId}, 'ewallet', 'GoPay', '081234567890', 'Demo Pekerja', false)`;

    // Ulasan contoh
    const av = (n: number) => `https://i.pravatar.cc/120?img=${n}`;
    const pic = (s: string) => `https://picsum.photos/seed/${s}/400`;
    const REVIEWS = [
      { name: "Ibu Christine", img: 45, rating: 5, comment: "Kerjanya rapi, tembok dapur jadi bagus sekali. Sangat recommended!", photos: [pic("torano-a"), pic("torano-b")], job: "Perbaikan tembok dapur", days: 3 },
      { name: "Pak Deni", img: 13, rating: 5, comment: "Datang tepat waktu, hasil sesuai kesepakatan. Terima kasih.", photos: null, job: "Cat ulang pagar depan", days: 6 },
      { name: "Kel. Lumintang", img: 5, rating: 4, comment: "Pasang rak dinding rapi, hanya sedikit telat datang.", photos: [pic("torano-c")], job: "Pasang rak dinding", days: 11 },
      { name: "Ibu Yanti", img: 47, rating: 5, comment: "Plafon bocor langsung beres. Bersih setelah kerja.", photos: null, job: "Perbaikan plafon", days: 18 },
      { name: "Rio Mamahit", img: 60, rating: 5, comment: "Cepat, teliti, dan harga wajar. Mantap.", photos: null, job: "Perbaikan pintu macet", days: 25 },
      { name: "Pak Hans", img: 33, rating: 4, comment: "Hasil bagus, komunikasi enak.", photos: null, job: "Renovasi kamar mandi", days: 40 },
    ];
    for (const r of REVIEWS) {
      await sql`
        insert into reviews (worker_application_id, reviewer_name, reviewer_avatar, rating, comment, photos, job_title, created_at)
        values (${appId}, ${r.name}, ${av(r.img)}, ${r.rating}, ${r.comment}, ${r.photos}, ${r.job}, now() - ${r.days} * interval '1 day')`;
    }

    // Booking contoh (permintaan masuk, jadwal hari ini, selesai)
    const at = (h: number) => {
      const d = new Date();
      d.setHours(h, 0, 0, 0);
      return d.toISOString();
    };
    const ago = (days: number) => new Date(Date.now() - days * 86400000).toISOString();
    const BOOKINGS: Array<{ cust: string; img: number; job: string; area: string; price: number; status: string; sched: string | null; created: string }> = [
      { cust: "Ibu Sarah", img: 44, job: "Perbaikan atap bocor", area: "Wanea", price: 150, status: "new", sched: null, created: ago(0) },
      { cust: "Pak Yusuf", img: 12, job: "Cat ulang ruang tamu", area: "Sario", price: 200, status: "new", sched: null, created: ago(0) },
      { cust: "Kel. Rumagit", img: 5, job: "Ganti keran & pipa bocor", area: "Wanea", price: 120, status: "scheduled", sched: at(14), created: ago(1) },
      { cust: "Ibu Meta", img: 32, job: "Pasang teralis jendela", area: "Tikala", price: 180, status: "scheduled", sched: at(17), created: ago(1) },
      { cust: "Pak Boy", img: 15, job: "Servis pompa air", area: "Malalayang", price: 135, status: "completed", sched: ago(2), created: ago(2) },
      { cust: "Rio Mamahit", img: 60, job: "Perbaikan pintu macet", area: "Wenang", price: 110, status: "completed", sched: ago(4), created: ago(4) },
      { cust: "Ibu Yanti", img: 47, job: "Cat kamar tidur", area: "Wanea", price: 90, status: "completed", sched: ago(20), created: ago(20) },
    ];
    for (const bk of BOOKINGS) {
      await sql`
        insert into bookings (worker_application_id, customer_name, customer_avatar, job_title, area, price, scheduled_at, status, created_at)
        values (${appId}, ${bk.cust}, ${av(bk.img)}, ${bk.job}, ${bk.area}, ${bk.price}, ${bk.sched}, ${bk.status}, ${bk.created})`;
    }

    // Satu penarikan dana contoh (agar riwayat penghasilan berisi kredit & debit).
    const pa = await sql`select id from payout_accounts where worker_application_id = ${appId} and is_primary = true limit 1`;
    if (pa[0]) {
      await sql`
        insert into withdrawals (worker_application_id, payout_account_id, amount, status, created_at)
        values (${appId}, ${pa[0].id}, 100, 'paid', now() - 5 * interval '1 day')`;
    }

    console.log("  + data pendaftaran, ulasan, booking, & penarikan demo pekerja dibuat");
  }

  // Percakapan contoh antara demo pencari dan demo pekerja.
  const cust = await sql`select id from profiles where email = 'pencari@torano.app' limit 1`;
  const work = await sql`select id from profiles where email = 'pekerja@torano.app' limit 1`;
  if (cust[0] && work[0]) {
    await sql`delete from conversations where customer_profile_id = ${cust[0].id} and worker_profile_id = ${work[0].id}`;
    const conv = await sql`
      insert into conversations (customer_profile_id, worker_profile_id, last_message, last_message_at)
      values (${cust[0].id}, ${work[0].id}, 'Baik, saya tunggu tawarannya ya', now())
      returning id`;
    const cid = conv[0]?.id;
    if (!cid) throw new Error("Gagal membuat percakapan");
    const MSGS = [
      { s: work[0].id, body: "Halo Kak, saya sudah periksa lokasinya. Ini estimasi biaya dan waktu pengerjaannya.", m: 30 },
      { s: cust[0].id, body: "Baik, saya tunggu tawarannya ya Pak.", m: 25 },
      { s: work[0].id, body: "Untuk perbaikan tembok dapur, kira-kira 3 jam pengerjaan.", m: 20 },
    ];
    for (const msg of MSGS) {
      await sql`
        insert into messages (conversation_id, sender_profile_id, type, body, created_at)
        values (${cid}, ${msg.s}, 'text', ${msg.body}, now() - ${msg.m} * interval '1 minute')`;
    }
    console.log("  + percakapan contoh dibuat");
  }

  console.log("Selesai.");
  await sql.end();
}

main().catch((err) => {
  console.error("Gagal:", err);
  process.exit(1);
});
