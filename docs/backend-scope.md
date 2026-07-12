# Backend Scope (Fase 0)

## Deskripsi Singkat Torano
Torano adalah platform yang mempertemukan pelanggan dengan pekerja informal (seperti ART, tukang masak, montir, teknisi AC, pekerja acara, pekerja adat, dan bidang pekerjaan informal lainnya). Pelanggan dapat mencari pekerja berdasarkan kategori dan lokasi, melihat profil mereka, dan menghubungi mereka melalui chat.

## Tujuan Backend
Backend Torano bertindak sebagai pusat pengelolaan data dan logika bisnis (API profil, kategori, pencarian pekerja), sekaligus berintegrasi dengan ekosistem Supabase untuk fitur seperti autentikasi, penyimpanan media, dan komunikasi realtime. 

## Daftar Aktor
- **Pelanggan (Customer)**: Mencari pekerja, melihat profil, dan mengirim pesan kepada pekerja.
- **Pekerja (Worker)**: Menawarkan layanan, mengatur profil, dan memperbarui lokasi secara manual.
- **Admin**: Mengelola platform dan aturan bisnis.

## Daftar Fitur MVP
1. Autentikasi
2. Profil pekerja
3. Pencarian pekerja berdasarkan lokasi
4. Chat realtime

## Daftar Fitur yang Tidak Masuk MVP
- Tawaran harga
- Booking
- Pembayaran
- Ulasan
- Laporan
- Sengketa
- Saldo
- Pencairan
- Notifikasi lanjutan

## Stack Final
- **Backend Framework**: Express
- **Bahasa Pemrograman**: TypeScript
- **ORM & Validasi**: Drizzle ORM, Zod
- **Database & Geospasial**: Supabase PostgreSQL, PostGIS
- **Layanan BaaS**: Supabase Auth, Supabase Storage, Supabase Realtime

## Pembagian Tanggung Jawab Teknologi
1. **Express + TypeScript + Drizzle**
   Digunakan untuk: API profil pengguna, API profil pekerja, kategori pekerjaan, pembaruan lokasi pekerja, pencarian pekerja berdasarkan lokasi, query PostGIS, operasi admin, dan aturan bisnis backend.
2. **Supabase Auth**
   Digunakan untuk: Registrasi, login, session, JWT pengguna, dan identitas pengguna.
3. **Supabase Storage**
   Digunakan untuk: Foto profil, foto portofolio, dan lampiran chat (jika nanti dibutuhkan).
4. **Supabase Realtime**
   Digunakan untuk: Chat dasar yang diakses langsung oleh frontend.

## Batas Ruang Lingkup Fase Pengembangan Pertama
Pengembangan pertama secara eksklusif akan mencakup autentikasi (Supabase Auth), manajemen profil dan pencarian lokasi (melalui Express + Drizzle + PostGIS), serta sistem chat (Supabase client + Realtime). Segala fitur yang menyangkut transaksi, ulasan, atau notifikasi push belum menjadi fokus.

## Definisi Selesai (Definition of Done) untuk Fase 0
- Dokumen ruang lingkup, arsitektur tingkat tinggi, arsitektur chat, dan arsitektur lokasi berhasil dibuat.
- Daftar keputusan final dicatat (stack, tanggung jawab teknologi, dll).
- Tidak ada source code, schema, atau dependency yang diubah.
- Tidak ada fitur yang diimplementasikan.
