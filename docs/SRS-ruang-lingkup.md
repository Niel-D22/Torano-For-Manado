# SRS — Ruang Lingkup Sistem
## Torano (Bakudapa) — Platform Penghubung Pekerja Informal Manado

**Versi:** 0.1 (draft) · **Tanggal:** 9 Juli 2026

---

## 1. Deskripsi Umum

Torano adalah platform web yang menghubungkan **pencari jasa** (warga/rumah tangga)
dengan **pekerja informal** di Manado: ART & bersih rumah, tukang harian,
kru acara & adat, serta montir panggilan. Sistem menyediakan pencarian
berbasis kategori dan lokasi (peta), profil pekerja dengan reputasi berbasis
komunitas (*trust lokal*, ulasan, rating), negosiasi harga lewat chat, dan
pembayaran melalui payment gateway.

### 1.1 Aktor Sistem

| Aktor | Deskripsi |
|---|---|
| **Pencari Jasa (Customer)** | Warga yang mencari dan memesan jasa pekerja informal. |
| **Mitra Pekerja (Partner)** | Pekerja informal yang menawarkan jasa, menerima/menolak permintaan kerja. |
| **Sistem Pembayaran (eksternal)** | Payment gateway (Midtrans) untuk memproses pembayaran. |
| **Admin** *(opsional/fase lanjut)* | Verifikasi mitra dan moderasi konten. |

---

## 2. Alur Sistem (System Flow)

### 2.1 Alur Utama — Pencari Jasa Memesan Pekerja (end-to-end)

```
[Mulai]
   │
   ▼
1. Buka beranda (/) → lihat kategori & pekerja unggulan
   │
   ▼
2. Cari pekerja (/cari)
   • filter: kategori, kata kunci, jarak/kawasan
   • alternatif: lihat sebaran pekerja di peta (/peta)
   │
   ▼
3. Buka profil pekerja (/pekerja/:id)
   • lihat skill, tarif (min–maks), rating & ulasan,
     "trust lokal" (dikenal warga/komunitas), lokasi di mini-map
   │
   ▼
4. Hubungi pekerja → masuk ruang chat (/chat/:id)
   • kirim pesan teks / bagikan lokasi
   │
   ▼
5. Negosiasi harga (fitur "tawaran" di chat)
   • customer kirim tawaran → mitra terima / tawar balik
   • kesepakatan tercapai → status tawaran = disepakati
   │
   ▼
6. Pembayaran (Midtrans)
   • pilih metode (GoPay/VA/dll) → bayar → sistem konfirmasi
   • dana ditahan sistem sampai pekerjaan selesai (escrow — fase lanjut)
   │
   ▼
7. Pekerjaan dilaksanakan sesuai jadwal
   │
   ▼
8. Konfirmasi selesai → dana diteruskan ke mitra
   │
   ▼
9. Customer memberi rating & ulasan → reputasi mitra terbarui
   │
   ▼
[Selesai]
```

### 2.2 Alur Mitra Pekerja

```
1. Login sebagai mitra → dashboard mitra (/mitra)
2. Atur status ketersediaan (tersedia / tidak tersedia)
3. Terima notifikasi permintaan kerja baru
   (pekerjaan, lokasi, jarak, harga, jadwal)
4. Terima atau tolak permintaan
   • terima → pekerjaan masuk daftar aktif, chat dengan customer terbuka
   • tolak  → permintaan dikembalikan ke sistem
5. Negosiasi harga di chat (jika ada tawaran)
6. Laksanakan pekerjaan → tandai selesai
7. Terima pembayaran → lihat riwayat pendapatan
8. Menerima rating & ulasan dari customer
```

### 2.3 Alur Autentikasi

```
1. Pengguna membuka /login
2. Masuk dengan nomor HP + kata sandi
   (registrasi: nomor HP → verifikasi OTP → pilih peran: customer / mitra)
3. Sistem membuat sesi (Supabase Auth)
4. Redirect sesuai peran: customer → beranda, mitra → dashboard mitra
```

### 2.4 Alur Pembayaran (detail)

```
1. Kesepakatan harga tercapai di chat
2. Customer menekan tombol "Bayar" → sheet pembayaran terbuka
3. Pilih metode pembayaran → proses via Midtrans (Snap)
4. Callback/notifikasi status: sukses / pending / gagal
5. Sukses → pesan "pembayaran diterima" muncul di chat,
   status pesanan berubah menjadi "dibayar"
```

### 2.5 Alur SOS / Permintaan Cepat *(terlihat di dashboard mitra — opsional)*

```
1. Customer membuat permintaan mendesak
2. Sistem menyiarkan ke mitra terdekat yang tersedia (dengan hitung mundur)
3. Mitra pertama yang menerima mendapat pekerjaan
```

---

## 3. Batasan Sistem (System Boundaries & Constraints)

### 3.1 Di Dalam Ruang Lingkup (In-Scope)

1. Aplikasi **web responsif** (mobile-first) — bukan aplikasi mobile native.
2. Dua peran pengguna: **pencari jasa** dan **mitra pekerja**.
3. Empat kategori jasa: ART & bersih rumah, tukang harian, kru acara & adat, montir panggilan.
4. Pencarian & filter pekerja berdasarkan kategori, kata kunci, dan kawasan/jarak.
5. Peta sebaran pekerja menggunakan **OpenStreetMap/Leaflet** (bukan Google Maps berbayar).
6. Profil pekerja: skill, rentang tarif, rating, ulasan, indikator kepercayaan komunitas.
7. Chat 1-lawan-1 antara customer dan mitra (teks, bagikan lokasi, tawaran harga).
8. Negosiasi harga melalui mekanisme tawaran di dalam chat.
9. Pembayaran melalui **Midtrans (mode sandbox)** untuk keperluan demo/lomba.
10. Autentikasi berbasis nomor HP (Supabase Auth).
11. Dashboard mitra: ketersediaan, daftar permintaan, terima/tolak pekerjaan.

### 3.2 Di Luar Ruang Lingkup (Out-of-Scope)

1. **Aplikasi mobile native** (Android/iOS) — hanya web.
2. **Pembayaran produksi nyata** — hanya sandbox/simulasi; tanpa penarikan dana riil, tanpa rekonsiliasi keuangan.
3. **Verifikasi identitas otomatis** (KTP/e-KYC, background check) — verifikasi mitra dilakukan manual/di luar sistem.
4. **Pelacakan lokasi real-time** pekerja (live tracking) — lokasi hanya statis/dibagikan manual.
5. **Panggilan suara/video** di dalam aplikasi — tombol telepon mengarah ke aplikasi telepon perangkat.
6. **Penjadwalan kompleks** (kalender berulang, langganan mingguan).
7. **Asuransi kerja, kontrak hukum, dan penggajian** mitra.
8. **Multi-kota** — cakupan wilayah terbatas **Kota Manado dan sekitarnya**.
9. **Multi-bahasa** — antarmuka hanya Bahasa Indonesia.
10. Sistem rekomendasi berbasis AI/ML.

### 3.3 Batasan Teknis (Technical Constraints)

| Aspek | Batasan |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS + React Router (SPA) |
| Backend | Node.js + Express (REST API) |
| Database & Auth | Supabase (PostgreSQL) |
| Peta | OpenStreetMap + Leaflet (gratis, tanpa API key berbayar) |
| Pembayaran | Midtrans Snap — **sandbox only** |
| Browser dukungan | Browser modern (Chrome, Edge, Firefox, Safari versi terbaru) |
| Perangkat | Responsif 360px–1440px; dioptimalkan untuk ponsel |
| Koneksi | Membutuhkan koneksi internet; tidak ada mode offline |

### 3.4 Asumsi & Ketergantungan

1. Pengguna memiliki ponsel dengan browser dan nomor HP aktif.
2. Layanan pihak ketiga (Supabase, Midtrans sandbox, tile OpenStreetMap) tersedia dan tidak berubah API-nya selama pengembangan.
3. Data pekerja awal (seed) diinput oleh tim; pendaftaran mandiri mitra menyusul.
4. Kepercayaan komunitas ("dikenal warga RT/jemaat") diinput sebagai teks deskriptif, bukan hasil verifikasi sistem.

---

## 4. Status Implementasi Saat Ini (per 9 Juli 2026)

| Komponen | Status |
|---|---|
| UI Frontend (9 halaman: Home, Cari, Peta, Profil Pekerja, Inbox, Chat Room, Dashboard Mitra, Login, 404) | ✅ Selesai (prototipe, data dummy) |
| Chat + negosiasi + bagikan lokasi | ✅ UI selesai — data lokal (belum persist / belum real-time) |
| Pembayaran Midtrans | ⚠️ Mock UI saja — belum terhubung Midtrans sandbox |
| Login / Auth | ⚠️ UI saja — belum terhubung Supabase Auth |
| Backend API | ⚠️ Skeleton — baru endpoint health check |
| Database (Supabase) | ❌ Skema belum dibuat |

### Prioritas lanjutan yang disarankan
1. Desain skema database (users, workers, categories, conversations, messages, offers, orders, payments, reviews).
2. Auth Supabase (registrasi + login nomor HP, peran customer/mitra).
3. API pekerja (list, detail, filter) → ganti data dummy frontend.
4. Persist chat & tawaran (Supabase Realtime untuk pesan langsung).
5. Integrasi Midtrans Snap sandbox.
6. Rating & ulasan pasca-pesanan selesai.
