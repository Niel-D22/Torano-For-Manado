# Arsitektur Lokasi Torano (Fase 0)

## Alasan Menggunakan PostGIS
Pencarian pekerja di sekitar lokasi pelanggan adalah salah satu fitur krusial (MVP) Torano. Ekstensi **PostGIS** pada PostgreSQL digunakan karena ia merupakan standar industri untuk pengolahan data geospasial. PostGIS memungkinkan eksekusi perhitungan jarak atau query radius secara sangat efisien langsung di level database, jauh lebih cepat ketimbang menarik semua baris (row) ke server backend Express untuk dihitung jaraknya satu persatu menggunakan rumus Haversine (di aplikasi/backend level).

## Bentuk Data Lokasi Pekerja
Data koordinat pekerja akan disimpan menggunakan format tipe data geospasial (bukan sekadar FLOAT biasa).
- **Tipe Konseptual Lokasi**: `geometry(Point, 4326)`
- **Sistem Referensi Koordinat**: SRID 4326 (WGS 84 - Format koordinat GPS standar bumi)
- **Urutan Titik**: Penulisan fungsi di PostGIS umumnya menggunakan format **(longitude, latitude)**, berkebalikan dengan API Maps awam yang sering memakai (latitude, longitude).

## Strategi Pembaruan Lokasi
Pembaruan lokasi didesain sebagai aksi yang dilakukan atas inisiatif pengguna.
- Pekerja memperbarui lokasinya secara **manual** melalui halaman pengeditan profil mereka di Frontend.
- HTTP Request (misalnya PUT) dari frontend dikirim ke Express API, divalidasi, lalu Express API menggunakan Drizzle ORM untuk meng-update field geometry di profil pengguna tersebut.
- **Tidak ada continuous tracking** (pelacakan lokasi terus-menerus/live location). Hal ini menghemat penggunaan baterai, mengurangi request server yang intensif, serta lebih menghormati privasi.

## Strategi Pencarian Radius
Pencarian dilakukan secara _server-side_ di PostgreSQL melalui PostGIS:
1. Pelanggan mendefinisikan lokasi saat ini (atau memilih lokasi tertentu dari peta/frontend).
2. Frontend mengirim koordinat pelanggan beserta kategori pekerjaan yang dicari ke Express API.
3. Express API menyusun query pencarian menggunakan fungsi pencarian spasial PostGIS (contohnya memanggil fungsi `ST_DWithin` untuk batasan jarak maksimal atau `ST_Distance` untuk pengurutan pekerja berdasarkan jarak terdekat).
4. Daftar pekerja difilter (misalnya jarak < 10 km) dan disajikan kepada pelanggan.

## Penggunaan Spatial Index (Secara Konseptual)
Untuk menjaga agar query geospasial tetap kencang meskipun baris tabel membesar, sistem database wajib menerapkan **Spatial Index**. 
Pada saat fase pembuatan skema, field koordinat pekerja di tabel profil wajib diberikan indeks berbasis GiST (Generalized Search Tree). Tanpa index geospasial, PostGIS akan melakukan pemindaian data spasial yang berat terhadap seluruh baris di tabel.

## Aturan Privasi Koordinat
Pekerja informal di Torano tidak bertugas layaknya pengemudi ojek online komersial yang sedang bergerak menuju konsumen; mereka adalah individu.
- Koordinat absolut/presisi (titik pastinya sebuah rumah) milik pekerja **tidak boleh ditampilkan secara publik** secara mentah ke pelanggan.
- Respons dari API backend ke Frontend pelanggan hanya akan menampilkan **jarak relatif** (contoh: "berjarak 2,3 km dari Anda") atau titik lokasi **perkiraan/area**.

## Batasan Lokasi MVP
- Pembaruan lokasi sepenuhnya manual, tidak ada layanan sinkronisasi GPS latar belakang (background sync).
- API Map eksternal canggih untuk estimasi waktu tempuh jalan (seperti Google Maps Distance Matrix) tidak digunakan pada fase MVP. Batas radius hanyalah "garis lurus udara" (haversine/geospatial distance standar).
