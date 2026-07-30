// Data dummy untuk sisi pekerja (mitra) Torano. Harga & saldo dalam ribuan
// rupiah (mis. 135 = Rp135.000), mengikuti konvensi harga di data pencari.

export const partner = {
  name: "Ventje Tumbelaka",
  category: "tukang",
  area: "Wanea",
  rating: 4.9,
  jobsDone: 132,
  photoId: 1,
  balance: 1250, // Rp1.250.000 siap ditarik
  weeklyEarning: 850, // Rp850.000 minggu ini
  weeklyJobs: 6,
};

// Permintaan yang masuk & menunggu keputusan pekerja.
export const partnerRequests = [
  {
    id: 1,
    customer: "Ibu Christine",
    job: "Perbaikan tembok dapur retak",
    area: "Wanea",
    distanceKm: 1.2,
    price: 135,
    when: "Sabtu, 09:00",
    status: "new",
  },
  {
    id: 2,
    customer: "Pak Deni",
    job: "Cat ulang pagar depan",
    area: "Sario",
    distanceKm: 2.4,
    price: 110,
    when: "Minggu, 08:00",
    status: "new",
  },
  {
    id: 3,
    customer: "Kel. Lumintang",
    job: "Pasang rak dinding & perbaikan pintu",
    area: "Bahu",
    distanceKm: 1.8,
    price: 90,
    when: "Fleksibel",
    status: "new",
  },
];

// Pekerjaan yang sudah dijadwalkan hari ini (sudah diterima).
export const partnerSchedule = [
  {
    id: 11,
    time: "10:00",
    customer: "Kel. Rumagit",
    job: "Ganti keran & pipa bocor",
    area: "Wanea",
    status: "berlangsung",
  },
  {
    id: 12,
    time: "14:30",
    customer: "Ibu Sarah",
    job: "Pasang plafon kamar",
    area: "Karombasan",
    status: "menuju",
  },
  {
    id: 13,
    time: "17:00",
    customer: "Pak Hans",
    job: "Perbaikan engsel lemari",
    area: "Sario",
    status: "menunggu",
  },
];

// Pekerjaan mendadak (SOS) yang butuh diambil cepat.
export const partnerSOS = {
  job: "Bantu masak acara keluarga — 3 jam",
  area: "Tikala",
  distanceKm: 3.1,
  price: 180,
  seconds: 288,
};
