# Architecture & Technical Decisions Torano (Fase 0)

Berikut adalah daftar keputusan teknis dan arsitektur yang sudah difinalisasi untuk Fase 0.

| ID | Keputusan | Alasan | Konsekuensi | Status |
|----|-----------|--------|-------------|--------|
| DEC-01 | **Express + TypeScript** | Framework backend minimal dan cepat; TypeScript memastikan type-safety yang ketat sejak awal fase pengembangan MVP. | Harus mengatur konfigurasi kompilasi (`tsconfig.json`), dan semua interaksi bisnis kustom harus melalui middleware Express. | Diterima |
| DEC-02 | **Drizzle ORM** | Sangat ringan, fully-typed dengan TypeScript, dan memiliki query builder yang menyerupai sintaks SQL asli. | Tidak menggunakan Prisma/TypeORM, yang berarti developer perlu lebih memahami skema SQL. | Diterima |
| DEC-03 | **Supabase PostgreSQL** | Basis data relasional unggul; integrasi bawaan dari ekosistem Supabase, mendukung RLS (Row Level Security). | Mengikat database ke infrastruktur Supabase, meskipun PostgreSQL-nya open source. | Diterima |
| DEC-04 | **PostGIS** | Perlu kalkulasi spasial yang efisien di level database untuk pencarian jarak pekerja. Supabase PostgreSQL sudah mendukung ekstensi ini. | Membutuhkan tipe data khusus `geometry` dan spatial index (GiST) pada tabel pekerja. | Diterima |
| DEC-05 | **Supabase Auth** | Menangani manajemen identitas (login, session, JWT) dengan aman tanpa repot membuat sistem otentikasi kustom di Express. | Frontend dan Express API sangat bergantung pada standar token JWT dari Supabase (verifikasi token wajib). | Diterima |
| DEC-06 | **Supabase Storage** | Pengelolaan media yang terintegrasi (foto profil, dll) satu pintu dengan sistem Auth RLS Supabase. | Media besar dilayani via Bucket Supabase dan terpisah dari server Express API. | Diterima |
| DEC-07 | **Chat langsung melalui Supabase** | Memotong latensi; Frontend langsung melakukan `insert` ke tabel chat Supabase yang dijaga RLS, tanpa perlu route Express API. | Aturan keamanan (RLS) untuk tabel chat harus sangat ketat dan spesifik (memverifikasi auth.uid()). | Diterima |
| DEC-08 | **Supabase Realtime Broadcast** | Pesan baru di-broadcast ke klien menggunakan database trigger secara realtime, menghemat resource server (tanpa web-socket kustom). | Frontend penerima wajib *subscribe* ke *private channel* percakapan terkait. | Diterima |
| DEC-09 | **Satu role utama per pengguna pada MVP** | Menyederhanakan proses registrasi dan otorisasi. Pengguna mendaftar sebagai "pelanggan" atau "pekerja". | Fleksibilitas peralihan atau multi-role tidak tersedia pada tahap awal. | Diterima |
| DEC-10 | **Lokasi pekerja diperbarui manual** | Mencegah _battery drain_, menurunkan beban server, menjaga privasi; tidak menggunakan sistem _live tracking_. | Informasi ketersediaan lokasi tidak *real-time* hingga detik ini; pekerja harus sadar untuk mengupdate jika pindah posisi drastis. | Diterima |
| DEC-11 | **Tidak ada fitur di luar MVP** | Memastikan *time-to-market* dan kualitas inti terjaga (pembayaran, booking, ulasan, ditiadakan sementara). | Pengembangan sangat terfokus hanya pada autentikasi, manajemen profil, cari lokasi, dan chat. | Diterima |
