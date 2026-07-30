<div align="center">
  <img src="frontend/src/assets/Logo_torano_noBG.png" alt="Torano Logo" width="180" />

# Torano

**Platform layanan jasa lokal yang mempertemukan pelanggan dengan pekerja informal terverifikasi.**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#-license)

</div>

<br/>

## 📖 Daftar Isi

- [📌 Tentang Project](#-tentang-project)
- [✨ Features](#-features)
- [🧩 Tech Stack](#-tech-stack)
- [🚀 Installation](#-installation)
- [🔐 Environment Variable](#-environment-variable)
- [▶️ Running](#️-running)
- [📁 Folder Structure](#-folder-structure)
- [📡 API Documentation](#-api-documentation)
- [🤝 Contribution](#-contribution)
- [📄 License](#-license)

---

## 📌 Tentang Project

**Torano** adalah aplikasi web marketplace jasa lokal yang membantu pelanggan menemukan pekerja informal seperti ART, montir, teknisi, dan tenaga acara. Pekerja dapat mendaftar, melengkapi data verifikasi, menerima pekerjaan, berkomunikasi melalui chat, memantau jadwal, melihat ulasan, serta mengelola penghasilan.

Project ini terdiri dari dua aplikasi:

| Folder | Deskripsi |
|---|---|
| 🎨 `frontend/` | Antarmuka pengguna berbasis **React** dan **Vite**. |
| ⚙️ `backend/` | REST API berbasis **Express**, **TypeScript**, **Drizzle ORM**, dan **PostgreSQL (Supabase)**. |

---

## ✨ Features

<details open>
<summary><b>🧑‍💻 Customer</b></summary>

- 🔐 Registrasi dan login menggunakan email/password atau Google OAuth.
- 🔍 Pencarian pekerja berdasarkan kategori dan informasi layanan.
- 🗺️ Tampilan daftar serta peta lokasi pekerja.
- 👤 Detail profil pekerja terverifikasi.
- 💬 Chat langsung dengan pekerja.
- 🧾 Profil akun pelanggan.
- 🔔 Notifikasi aktivitas chat, pekerjaan, dan ulasan.

</details>

<details>
<summary><b>🧰 Worker</b></summary>

- 📝 Pendaftaran sebagai mitra pekerja.
- 🪪 Pengisian data diri, keahlian, wilayah layanan, tarif, foto, dan lokasi.
- 🖼️ Pengelolaan portofolio, referensi, dan rekening pencairan.
- ✅ Pengajuan verifikasi kepada admin.
- 📊 Dashboard ringkasan aktivitas.
- 📅 Pengelolaan jadwal dan status pekerjaan.
- ⭐ Riwayat ulasan pelanggan.
- 💰 Ringkasan penghasilan dan pengajuan penarikan dana.

</details>

<details>
<summary><b>🛡️ Admin</b></summary>

- 🔑 Login admin menggunakan sesi terpisah.
- 📋 Melihat daftar pengajuan pekerja.
- 🔎 Memeriksa detail identitas, portofolio, referensi, dan rekening pekerja.
- ✔️ Menyetujui atau menolak pengajuan pekerja.
- 🔄 Memperbarui status pemeriksaan referensi.

</details>

<details>
<summary><b>🏗️ Platform</b></summary>

- 🔐 Supabase Auth untuk autentikasi pengguna.
- 🗂️ Supabase Storage untuk unggahan gambar.
- ⚡ Supabase Realtime untuk pembaruan chat.
- 🧪 Validasi request menggunakan Zod.
- 📝 Structured logging dan request ID.
- 🚨 Global error handling.
- 🗃️ Database migration menggunakan Drizzle Kit.
- 🛑 Graceful shutdown pada server backend.

</details>

---

## 🧩 Tech Stack

<table>
<tr>
<td valign="top" width="33%">

### 🎨 Frontend
- React 18
- Vite
- React Router
- Tailwind CSS
- Axios
- Supabase JS Client
- Framer Motion
- Leaflet & React Leaflet
- Lucide React
- Sonner

</td>
<td valign="top" width="33%">

### ⚙️ Backend
- Node.js
- Express 5
- TypeScript
- Drizzle ORM
- PostgreSQL (Supabase)
- Supabase Auth, Storage, Realtime
- Zod
- Pino & Pino HTTP
- postgres.js

</td>
<td valign="top" width="33%">

### 🗄️ Database
Tabel utama:
- `profiles`
- `categories`
- `worker_applications`
- `worker_portfolios`
- `worker_references`
- `payout_accounts`
- `bookings`
- `reviews`
- `withdrawals`
- `conversations`
- `messages`

</td>
</tr>
</table>

---

## 🚀 Installation

### ✅ Prerequisites

Pastikan perangkat sudah memiliki:

- 🟢 Node.js versi modern, disarankan Node.js 20 atau lebih baru.
- 📦 npm.
- ☁️ Project Supabase aktif.
- 🔗 PostgreSQL database URL dari Supabase.

### 1️⃣ Clone repository

```bash
git clone <repository-url>
cd torano
```

### 2️⃣ Install backend dependencies

```bash
cd backend
npm install
```

### 3️⃣ Install frontend dependencies

Buka terminal lain dari root project:

```bash
cd frontend
npm install
```

### 4️⃣ Configure Supabase

Di dashboard Supabase:

1. Aktifkan autentikasi email/password.
2. Aktifkan Google OAuth bila fitur login Google digunakan.
3. Tambahkan redirect URL frontend, misalnya `http://localhost:5173`.
4. Siapkan bucket Storage bernama `torano` untuk unggahan gambar.
5. Pastikan tabel `messages` tersedia untuk Supabase Realtime.

### 5️⃣ Prepare database

Dari folder `backend`:

```bash
npm run db:migrate
npm run db:seed
```

Script database tambahan yang tersedia:

```bash
npm run db:seed:workers
npm run db:seed:demo
npm run db:make-admin
npm run db:setup-storage
npm run db:setup-realtime
npm run db:studio
```

> ⚠️ **Perhatian:** Jalankan migration dan seed hanya pada database development yang benar. Periksa `DATABASE_URL` sebelum menjalankannya. Database production bukan arena eksperimen spontan.

---

## 🔐 Environment Variable

### ⚙️ Backend

Buat file `backend/.env` berdasarkan `backend/.env.example`:

```env
NODE_ENV=development
PORT=5000

DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE

SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

CORS_ORIGIN=http://localhost:5173

ADMIN_USERNAME=admin
ADMIN_PASSWORD=CHANGE_WITH_A_STRONG_PASSWORD
ADMIN_SECRET=CHANGE_WITH_A_LONG_RANDOM_SECRET
```

| Variable | Required | Description |
|---|:---:|---|
| `NODE_ENV` | ❌ | Environment aplikasi: `development`, `test`, atau `production`. |
| `PORT` | ❌ | Port backend. Default `5000`. |
| `DATABASE_URL` | ✅ | Connection string PostgreSQL. |
| `SUPABASE_URL` | ✅ | URL project Supabase. |
| `SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key. |
| `CORS_ORIGIN` | ✅ | Origin frontend yang diizinkan mengakses backend. |
| `ADMIN_USERNAME` | ❌ | Username login admin. |
| `ADMIN_PASSWORD` | ❌ | Password login admin. Wajib diganti untuk deployment. |
| `ADMIN_SECRET` | ❌ | Secret penandatangan token sesi admin. Wajib diganti untuk deployment. |

### 🎨 Frontend

Buat file `frontend/.env` berdasarkan `frontend/.env.example`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_API_BASE_URL=http://localhost:5000/api
```

> ⚠️ Variable dengan prefix `VITE_` tersedia di browser. Jangan menaruh service-role key, password database, atau secret admin di frontend.

---

## ▶️ Running

### 🔧 Development mode

Jalankan backend:

```bash
cd backend
npm run dev
```

Backend tersedia di:

```text
http://localhost:5000
```

Jalankan frontend pada terminal terpisah:

```bash
cd frontend
npm run dev
```

Frontend biasanya tersedia di:

```text
http://localhost:5173
```

### 📦 Production build

**Backend:**

```bash
cd backend
npm run typecheck
npm run build
npm start
```

**Frontend:**

```bash
cd frontend
npm run build
npm run preview
```

---

## 📁 Folder Structure

```text
torano/
├── backend/
│   ├── drizzle/                 # File migration Drizzle
│   ├── db/
│   │   └── schema.sql           # Referensi schema SQL lama
│   ├── src/
│   │   ├── config/              # Environment, database, dan Supabase client
│   │   ├── controllers/         # Handler request dan proses fitur
│   │   ├── db/
│   │   │   ├── schema/          # Definisi tabel dan relasi Drizzle
│   │   │   └── seed*.ts         # Seed dan setup database
│   │   ├── middleware/          # Auth, admin session, logging, dan error handler
│   │   ├── routes/              # Definisi endpoint Express
│   │   ├── shared/              # Error, HTTP response, logger, dan validation helper
│   │   ├── validators/          # Schema validasi Zod per fitur
│   │   └── app.ts               # Konfigurasi utama Express
│   ├── server.ts                # Bootstrap dan lifecycle HTTP server
│   ├── drizzle.config.ts        # Konfigurasi Drizzle Kit
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── public/                  # Asset publik
│   ├── src/
│   │   ├── assets/              # Logo, gambar, dan asset UI
│   │   ├── components/          # Komponen reusable
│   │   ├── data/                # Data statis pendukung UI
│   │   ├── layouts/             # Layout customer, worker, dan admin
│   │   ├── lib/                 # API client, auth, Supabase, dan upload helper
│   │   ├── pages/               # Halaman customer dan autentikasi
│   │   │   ├── admin/           # Halaman admin
│   │   │   └── worker/          # Halaman area mitra
│   │   ├── routes/              # Konfigurasi React Router
│   │   ├── App.jsx
│   │   └── main.jsx             # Entry point React
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

### 🔄 Backend request flow

```text
Request
  → Route
  → Authentication/validation middleware
  → Controller
  → Drizzle ORM
  → PostgreSQL
  → Standardized response
```

> 💡 Saat ini controller backend berinteraksi langsung dengan Drizzle ORM. Jika project bertambah besar, pemisahan bertahap ke `services/` dan `repositories/` dapat dilakukan agar business logic dan query database tidak menumpuk di controller.

---

## 📡 API Documentation

Base URL development:

```text
http://localhost:5000/api
```

🔒 Endpoint dengan tanda **Auth** membutuhkan header:

```http
Authorization: Bearer <supabase_access_token>
```

🛡️ Endpoint dengan tanda **Admin** membutuhkan token dari endpoint login admin.

### ❤️ Health

| Method | Endpoint | Access | Description |
|---|---|:---:|---|
| `GET` | `/health` | 🌐 Public | Memeriksa kondisi aplikasi. |
| `GET` | `/health/database` | 🌐 Public | Memeriksa koneksi database. |

### 🔑 Authentication and Profile

| Method | Endpoint | Access | Description |
|---|---|:---:|---|
| `POST` | `/auth/register` | 🌐 Public | Mendaftarkan pengguna melalui backend. |
| `POST` | `/auth/login` | 🌐 Public | Login pengguna melalui backend. |
| `POST` | `/auth/sync` | 🔒 Auth | Membuat atau menyinkronkan profile internal dari sesi Supabase. |
| `GET` | `/auth/me` | 🔒 Auth | Mengambil profile pengguna saat ini. |
| `PATCH` | `/auth/profile` | 🔒 Auth | Memperbarui profile pengguna. |

### 🏷️ Categories

| Method | Endpoint | Access | Description |
|---|---|:---:|---|
| `GET` | `/categories` | 🌐 Public | Mengambil kategori pekerjaan aktif. |

### 👷 Public Workers

| Method | Endpoint | Access | Description |
|---|---|:---:|---|
| `GET` | `/workers` | 🌐 Public | Mengambil daftar pekerja berstatus `verified`. |
| `GET` | `/workers/:id` | 🌐 Public | Mengambil detail pekerja terverifikasi. |

### 🧰 Worker Area

| Method | Endpoint | Access | Description |
|---|---|:---:|---|
| `GET` | `/worker/me` | 🔒 Auth | Mengambil data pekerja dan application milik pengguna. |
| `GET` | `/worker/me/dashboard` | 🔒 Auth | Mengambil ringkasan dashboard pekerja. |
| `GET` | `/worker/me/bookings` | 🔒 Auth | Mengambil daftar pekerjaan pekerja. |
| `PATCH` | `/worker/me/bookings/:id/status` | 🔒 Auth | Memperbarui status pekerjaan. |
| `GET` | `/worker/me/reviews` | 🔒 Auth | Mengambil ulasan pekerja. |
| `GET` | `/worker/me/earnings` | 🔒 Auth | Mengambil ringkasan penghasilan dan penarikan. |
| `POST` | `/worker/me/withdrawals` | 🔒 Auth | Mengajukan penarikan dana. |
| `PATCH` | `/worker/me/application` | 🔒 Auth | Membuat atau memperbarui draft application pekerja. |
| `POST` | `/worker/me/application/submit` | 🔒 Auth | Mengirim application untuk ditinjau admin. |
| `POST` | `/worker/me/references` | 🔒 Auth | Menambahkan referensi pekerja. |
| `DELETE` | `/worker/me/references/:id` | 🔒 Auth | Menghapus referensi pekerja. |
| `POST` | `/worker/me/portfolios` | 🔒 Auth | Menambahkan portofolio pekerja. |
| `DELETE` | `/worker/me/portfolios/:id` | 🔒 Auth | Menghapus portofolio pekerja. |
| `POST` | `/worker/me/payout-accounts` | 🔒 Auth | Menambahkan rekening pencairan. |
| `DELETE` | `/worker/me/payout-accounts/:id` | 🔒 Auth | Menghapus rekening pencairan. |

### 💬 Chat

| Method | Endpoint | Access | Description |
|---|---|:---:|---|
| `GET` | `/chat/conversations` | 🔒 Auth | Mengambil percakapan pengguna. |
| `POST` | `/chat/conversations` | 🔒 Auth | Membuat atau mengambil percakapan dengan pekerja. |
| `GET` | `/chat/conversations/:id/messages` | 🔒 Auth | Mengambil pesan dalam percakapan. |
| `POST` | `/chat/conversations/:id/messages` | 🔒 Auth | Mengirim pesan. |

### 🔔 Notifications

| Method | Endpoint | Access | Description |
|---|---|:---:|---|
| `GET` | `/notifications` | 🔒 Auth | Mengambil notifikasi pengguna. |

### 🛡️ Admin

| Method | Endpoint | Access | Description |
|---|---|:---:|---|
| `POST` | `/admin/login` | 🌐 Public | Login admin menggunakan username dan password. |
| `GET` | `/admin/me` | 🛡️ Admin | Memeriksa sesi admin saat ini. |
| `GET` | `/admin/worker-applications` | 🛡️ Admin | Mengambil daftar application pekerja. |
| `GET` | `/admin/worker-applications/:id` | 🛡️ Admin | Mengambil detail application pekerja. |
| `PATCH` | `/admin/worker-applications/:id/approve` | 🛡️ Admin | Menyetujui application pekerja. |
| `PATCH` | `/admin/worker-applications/:id/reject` | 🛡️ Admin | Menolak application pekerja. |
| `PATCH` | `/admin/references/:id` | 🛡️ Admin | Memperbarui status pemeriksaan referensi. |

### 📦 Standard response format

**✅ Successful response:**

```json
{
  "success": true,
  "data": {}
}
```

**📋 List response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "total": 0
  }
}
```

**❌ Error response:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request data is invalid",
    "details": []
  },
  "requestId": "request-uuid"
}
```

---

## 🤝 Contribution

1. 🍴 Fork repository.
2. 🌿 Buat branch dari branch utama:

   ```bash
   git checkout -b feature/nama-fitur
   ```

3. 📦 Install dependency dan buat konfigurasi environment lokal.
4. 📐 Ikuti struktur dan konvensi project yang sudah tersedia.
5. 🚫 Jangan commit `.env`, access token, password, atau secret.
6. ✅ Jalankan pemeriksaan sebelum commit:

   ```bash
   cd backend
   npm run typecheck
   npm run build

   cd ../frontend
   npm run build
   ```

7. 📝 Gunakan commit message yang jelas:

   ```bash
   git commit -m "feat: add customer booking endpoint"
   ```

8. ⬆️ Push branch dan buat Pull Request.
9. 📄 Jelaskan perubahan, cara pengujian, migration baru, dan risiko yang relevan pada deskripsi Pull Request.

### 🏷️ Suggested commit convention

| Prefix | Keterangan |
|---|---|
| `feat:` | ✨ fitur baru |
| `fix:` | 🐛 perbaikan bug |
| `refactor:` | ♻️ perubahan struktur tanpa mengubah perilaku |
| `docs:` | 📚 perubahan dokumentasi |
| `test:` | 🧪 penambahan atau perbaikan test |
| `chore:` | 🔧 maintenance dan konfigurasi |

---

## 📄 License

Project ini dilisensikan menggunakan **MIT License**.

<details>
<summary>📜 Lihat teks lisensi lengkap</summary>

```text
MIT License

Copyright (c) 2026 Torano

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

</details>

<div align="center">

---

Made with ❤️ by **LASALLE VIBERS**

</div>