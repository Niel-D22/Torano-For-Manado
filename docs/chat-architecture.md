# Arsitektur Chat Torano (Fase 0)

## Alasan Menggunakan Akses Langsung ke Supabase
Pendekatan akses langsung (direct client-to-Supabase) digunakan untuk memanfaatkan kemampuan **Supabase Realtime** dan fitur _Row Level Security_ (RLS) PostgreSQL bawaan secara optimal. Dengan cara ini, overhead pada Express API dapat diminimalisasi secara signifikan. Pengiriman pesan dapat diproses jauh lebih cepat tanpa perlu melalui HTTP bottleneck tambahan, dan Frontend langsung berlangganan ke _stream_ realtime.

## Konsep Tabel Database
Desain dasar terdiri dari dua tabel:
- `conversations`: Menyimpan _metadata_ percakapan antara pelanggan dan pekerja.
- `messages`: Menyimpan isi pesan tunggal yang terkait dengan suatu `conversation_id`.

## Alur Membaca Riwayat Pesan
1. Frontend memanggil `select` ke tabel `messages` melalui Supabase client.
2. PostgreSQL menjalankan kebijakan RLS. Pengguna hanya dapat membaca pesan yang ada di percakapan mereka sendiri (sebagai pengirim atau penerima).
3. Pesan dikembalikan untuk dirender sebagai riwayat chat di layar. Riwayat pesan dibaca langsung dari _persistence_ database (bukan dari cache atau event Realtime).

## Alur Pengiriman Pesan
1. **Frontend Pengirim** mengeksekusi operasi `insert` ke tabel `messages` via Supabase client, melampirkan teks pesan dan `conversation_id`.
2. PostgreSQL memvalidasi _insert_ menggunakan kebijakan RLS, di mana `sender_id` harus sama dengan user ID yang sedang aktif (`auth.uid()`).
3. Pesan disimpan secara permanen.

## Konsep Broadcast dan Database Trigger
Pengiriman pesan _text_ tidak dilakukan melalui Express API maupun Realtime Broadcast dari sisi klien. Sebagai gantinya:
- Supabase dilengkapi dengan **Database Trigger** (atau integrasi Webhooks/Realtime Event).
- Saat record baru ditambahkan di tabel `messages`, sistem Supabase di sisi server akan memancarkan (Broadcast) event _insert_ ini melalui **Supabase Realtime**.
- Ini memastikan bahwa setiap pesan yang dibroadcast sudah valid dan tersimpan di database secara permanen.

## Private Channel dan Realtime Authorization
- Setiap percakapan memiliki channel Realtime sendiri (contoh: `conversation:<conversation_id>`).
- Frontend hanya akan _subscribe_ ke channel yang sesuai dengan _conversation_ yang sedang aktif.
- **Realtime Authorization**: Meskipun Supabase Realtime secara default memancarkan perubahan ke klien, hak akses klien tersebut untuk menerima data (subscribe) dikendalikan oleh integrasi Realtime dengan kebijakan RLS. Klien yang bukan anggota percakapan tidak bisa masuk ke _private channel_ tersebut.

## Konsep Row Level Security (RLS)
Pada fase MVP, kebijakan RLS secara konseptual adalah:
- **Tabel Conversations**: Hanya pengguna yang terdaftar sebagai partisipan di `conversations` yang dapat melakukan operasi SELECT.
- **Tabel Messages**: 
  - **SELECT**: Boleh dibaca jika pengguna adalah anggota dari percakapan terkait.
  - **INSERT**: Boleh ditambah jika `sender_id` bernilai `auth.uid()` dan `auth.uid()` adalah salah satu partisipan dalam percakapan tersebut.

## Batasan Chat MVP
- Pesan yang dikirim hanya mendukung teks dasar. (Attachment atau media tidak didukung di MVP).
- Tidak ada fitur _hard delete_ pesan (fitur _unsent_ atau hapus permanen pesan tidak ada pada fase MVP).
- Tidak ada validasi filter kata kotor secara kompleks melalui backend Express.

## Risiko Keamanan dan Mitigasi
- **Risiko**: Frontend dapat memalsukan data (spoofing), contohnya mengirim `sender_id` pengguna lain.
  - **Mitigasi**: Aturan RLS di PostgreSQL memastikan bahwa `sender_id` yang di-insert harus sama mutlak dengan nilai `auth.uid()` di sisi server Supabase (yang disematkan di JWT auth). Data `sender_id` dari input Frontend _tidak akan dipercayai_ secara mentah tanpa divalidasi oleh kebijakan ini.
- **Risiko**: Pengguna iseng mendaftarkan (subscribe) channel percakapan orang lain.
  - **Mitigasi**: Penggunaan token yang terotorisasi beserta penegakan RLS channel memastikan klien tidak mendapatkan respons yang valid bila mencoba _subscribe_ ke channel terlarang.

## Kondisi untuk Migrasi Pesan ke Express API
Pengiriman pesan langsung dari Frontend ke Supabase merupakan efisiensi untuk MVP. Ke depannya, pengiriman pesan perlu dipindahkan ke rute **Express API** apabila platform membutuhkan:
- Filter kata-kata kotor (profanity check) dari sisi server sebelum pesan disimpan.
- Pemberitahuan Push Notifications kustom (misal lewat FCM) untuk aplikasi mobile (karena trigger langsung kurang fleksibel mengelola antrean notifikasi eksternal).
- Penilaian sengketa transaksi di mana admin perlu sistem perantara (bot) di dalam chat.
